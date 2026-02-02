/**
 * LLM API Client for direct API calls
 * This module can be used in tests without requiring browser/RPC infrastructure
 */

import axios from 'axios'

export type LLMProvider = 'openai' | 'gemini'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
  name?: string
  tool_calls?: LLMToolCall[] // For assistant messages that request tools
}

export interface LLMToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface LLMTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

export interface LLMApiConfig {
  provider?: LLMProvider
  apiKey: string
  model?: string
  maxTokens?: number
  tools?: LLMTool[]
}

export interface LLMApiResponse {
  content: string
  provider: string
  model: string
  toolCalls?: LLMToolCall[]
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

/**
 * Direct LLM API client for testing
 * Makes HTTP calls directly to LLM providers without going through backend
 */
export class LLMApiClient {
  private provider: LLMProvider
  private apiKey: string
  private model: string
  private maxTokens: number
  private tools?: LLMTool[]

  constructor(config: LLMApiConfig) {
    this.provider = config.provider || this.detectProvider(config.apiKey)
    this.apiKey = config.apiKey
    this.model = config.model || this.getDefaultModel(this.provider)
    this.maxTokens = config.maxTokens || 1000
    this.tools = config.tools
  }

  private detectProvider(apiKey: string): LLMProvider {
    if (apiKey.startsWith('sk-')) {
      return 'openai'
    }
    return 'gemini'
  }

  private getDefaultModel(provider: LLMProvider): string {
    return provider === 'openai' ? 'gpt-5-mini' : 'gemini-1.5-flash-latest'
  }

  /**
   * Send messages to LLM and get response
   */
  async chat(messages: LLMMessage[]): Promise<LLMApiResponse> {
    if (this.provider === 'openai') {
      return this.chatOpenAI(messages)
    } else {
      return this.chatGemini(messages)
    }
  }

  private async chatOpenAI(messages: LLMMessage[]): Promise<LLMApiResponse> {
    try {
      const requestBody: any = {
        model: this.model,
        messages: messages.map(m => {
          const msg: any = {
            role: m.role,
            content: m.content,
          }
          // For tool response messages
          if (m.role === 'tool') {
            msg.tool_call_id = m.tool_call_id
            // OpenAI requires the function name in tool messages
            msg.name = m.name || 'unknown_tool'
          }
          // For assistant messages with tool calls
          if (m.role === 'assistant' && m.tool_calls) {
            msg.tool_calls = m.tool_calls
          }
          return msg
        }),
        max_completion_tokens: this.maxTokens,
        reasoning_effort: 'minimal',
      }

      // Add tools if provided
      if (this.tools && this.tools.length > 0) {
        requestBody.tools = this.tools
      }

      // Debug: Log messages to see what's being sent
      console.log('OpenAI API Request - Messages:')
      requestBody.messages.forEach((msg: any, idx: number) => {
        console.log(`  [${idx}] role: ${msg.role}, has_tool_calls: ${!!msg.tool_calls}, has_tool_call_id: ${!!msg.tool_call_id}`)
        if (msg.tool_calls) {
          console.log(`      tool_calls:`, JSON.stringify(msg.tool_calls, null, 2))
        }
        if (msg.tool_call_id) {
          console.log(`      tool_call_id: ${msg.tool_call_id}`)
        }
      })

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 45000, // 45 second timeout for reasoning models
        }
      )

      const choice = response.data.choices?.[0]
      if (!choice) {
        throw new Error('No response from OpenAI')
      }

      const result: LLMApiResponse = {
        content: choice.message.content || '',
        provider: 'openai',
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens,
          completionTokens: response.data.usage?.completion_tokens,
          totalTokens: response.data.usage?.total_tokens,
        },
      }

      // Check if LLM wants to call tools
      if (choice.message.tool_calls) {
        result.toolCalls = choice.message.tool_calls.map((tc: any) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        }))
      }

      return result
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error'
      throw new Error(`OpenAI API error: ${errorMessage}`)
    }
  }

  private async chatGemini(messages: LLMMessage[]): Promise<LLMApiResponse> {
    try {
      // Convert messages to Gemini format
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))

      // Add system message to first user message if present
      const systemMessage = messages.find(m => m.role === 'system')
      if (systemMessage && contents.length > 0) {
        contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents,
          generationConfig: {
            maxOutputTokens: this.maxTokens,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      )

      const candidate = response.data.candidates?.[0]
      if (!candidate) {
        throw new Error('No response from Gemini')
      }

      return {
        content: candidate.content.parts[0].text || '',
        provider: 'gemini',
        model: this.model,
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount,
          completionTokens: response.data.usageMetadata?.candidatesTokenCount,
          totalTokens: response.data.usageMetadata?.totalTokenCount,
        },
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error'
      throw new Error(`Gemini API error: ${errorMessage}`)
    }
  }

  /**
   * Simple helper to send a single message with optional system prompt
   */
  async sendMessage(userMessage: string, systemPrompt?: string): Promise<string> {
    const messages: LLMMessage[] = []
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      })
    }
    
    messages.push({
      role: 'user',
      content: userMessage,
    })

    const response = await this.chat(messages)
    return response.content
  }
}

/**
 * Factory function to create LLM client from environment variables
 */
export function createLLMClientFromEnv(): LLMApiClient {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY
  
  if (!apiKey) {
    throw new Error('No LLM API key found in environment')
  }

  const provider = (process.env.LLM_PROVIDER as LLMProvider) || undefined

  return new LLMApiClient({
    apiKey,
    provider,
  })
}
