/**
 * LLM Service for interacting with topics
 * Provides AI assistance to help users understand and interact with MQTT topics
 */

import axios, { AxiosInstance } from 'axios'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type LLMProvider = 'openai' | 'gemini'

export interface LLMServiceConfig {
  apiKey?: string
  apiEndpoint?: string
  model?: string
  provider?: LLMProvider
  neighboringTopicsTokenLimit?: number
}

export class LLMService {
  private axiosInstance: AxiosInstance
  private model: string
  private provider: LLMProvider
  private conversationHistory: LLMMessage[] = []
  private neighboringTopicsTokenLimit: number

  constructor(config: LLMServiceConfig = {}) {
    const apiKey = config.apiKey || this.getApiKeyFromStorage() || this.getApiKeyFromEnv()
    this.provider = config.provider || this.getProviderFromStorage() || this.getProviderFromEnv() || 'openai'
    this.neighboringTopicsTokenLimit = config.neighboringTopicsTokenLimit || this.getNeighboringTopicsTokenLimitFromEnv() || 100
    
    // Set default endpoint and model based on provider
    let baseURL = config.apiEndpoint
    if (!baseURL) {
      baseURL = this.provider === 'gemini' 
        ? 'https://generativelanguage.googleapis.com/v1beta'
        : 'https://api.openai.com/v1'
    }
    
    this.model = config.model || (this.provider === 'gemini' ? 'gemini-1.5-flash-latest' : 'gpt-3.5-turbo')

    // Configure headers based on provider
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      if (this.provider === 'gemini') {
        // Gemini uses API key as query parameter, not header
        // Will be added to URL in sendMessage
      } else {
        headers.Authorization = `Bearer ${apiKey}`
      }
    }

    this.axiosInstance = axios.create({
      baseURL,
      headers,
      timeout: 30000,
    })

    // Initialize with system message
    this.conversationHistory.push({
      role: 'system',
      content: `You are an AI assistant helping users understand and interact with MQTT topics and their data. 
You have expertise in:
- MQTT protocol and message structures
- JSON and binary data formats
- IoT device patterns and common sensors
- Data analysis and interpretation
- Suggesting queries and operations

Provide clear, concise, and helpful responses. When analyzing topic data, focus on practical insights and actionable suggestions.`,
    })
  }

  private getApiKeyFromStorage(): string | undefined {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('llm_api_key') || undefined
    }
    return undefined
  }

  private getApiKeyFromEnv(): string | undefined {
    if (typeof process !== 'undefined' && process.env) {
      // Try provider-specific env vars first, then fall back to generic
      if (this.provider === 'gemini') {
        return process.env.GEMINI_API_KEY || process.env.LLM_API_KEY
      } else {
        return process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
      }
    }
    return undefined
  }

  private getProviderFromStorage(): LLMProvider | undefined {
    if (typeof window !== 'undefined' && window.localStorage) {
      const provider = window.localStorage.getItem('llm_provider')
      return provider === 'gemini' || provider === 'openai' ? provider : undefined
    }
    return undefined
  }

  private getProviderFromEnv(): LLMProvider | undefined {
    if (typeof process !== 'undefined' && process.env) {
      const provider = process.env.LLM_PROVIDER
      return provider === 'gemini' || provider === 'openai' ? provider : undefined
    }
    return undefined
  }

  private getNeighboringTopicsTokenLimitFromEnv(): number | undefined {
    if (typeof process !== 'undefined' && process.env) {
      const limit = parseInt(process.env.LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT || '', 10)
      return isNaN(limit) ? undefined : limit
    }
    return undefined
  }

  /**
   * Save API key to local storage
   */
  public saveApiKey(apiKey: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('llm_api_key', apiKey)
    }
  }

  /**
   * Save provider to local storage
   */
  public saveProvider(provider: LLMProvider): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('llm_provider', provider)
    }
  }

  /**
   * Clear API key from local storage
   */
  public clearApiKey(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('llm_api_key')
    }
  }

  /**
   * Check if API key is configured
   */
  public hasApiKey(): boolean {
    return !!this.getApiKeyFromStorage()
  }

  /**
   * Get current provider
   */
  public getProvider(): LLMProvider {
    return this.provider
  }

  /**
   * Estimate tokens in text (rough approximation: ~4 characters per token)
   */
  private estimateTokens(text: string): number {
    // Simple estimation: average ~4 characters per token
    // This is a rough approximation for both OpenAI and Gemini
    return Math.ceil(text.length / 4)
  }

  /**
   * Truncate text to fit within token limit
   */
  private truncateToTokenLimit(text: string, tokenLimit: number): string {
    const estimatedTokens = this.estimateTokens(text)
    if (estimatedTokens <= tokenLimit) {
      return text
    }
    
    // Truncate to approximate character count
    const maxChars = tokenLimit * 4
    if (text.length <= maxChars) {
      return text
    }
    
    return text.substring(0, maxChars - 3) + '...'
  }

  /**
   * Generate context from topic data including neighboring topics
   */
  public generateTopicContext(topic: { 
    path?: () => string
    message?: any
    messages?: number
    childTopicCount?: () => number
    type?: string
    parent?: any
    edgeCollection?: any
  }): string {
    const context = []
    
    if (topic.path) {
      context.push(`Topic Path: ${topic.path()}`)
    }
    
    // Add current value with preview
    if (topic.message?.payload) {
      const [value] = topic.message.payload.format(topic.type)
      if (value !== null && value !== undefined) {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value)
        const preview = this.truncateToTokenLimit(valueStr, 50) // Limit value preview to ~50 tokens
        context.push(`Value: ${preview}`)
      }
      
      // Add retained status if true
      if (topic.message.retain) {
        context.push(`Status: Retained`)
      }
    }
    
    // Add neighboring topics (siblings and children) up to token limit
    const neighbors: string[] = []
    let neighborsTokenCount = 0
    const tokenLimit = this.neighboringTopicsTokenLimit
    
    // Helper function to add a neighbor if within token limit
    const addNeighbor = (name: string, value: any, type?: string): boolean => {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value)
      const preview = this.truncateToTokenLimit(valueStr, 20) // Limit each neighbor to ~20 tokens
      const neighborEntry = `  ${name}: ${preview}`
      const tokens = this.estimateTokens(neighborEntry)
      
      if (neighborsTokenCount + tokens <= tokenLimit) {
        neighbors.push(neighborEntry)
        neighborsTokenCount += tokens
        return true
      }
      return false
    }
    
    // Get siblings from parent
    if (topic.parent && topic.parent.edgeCollection) {
      const siblings = topic.parent.edgeCollection.edges || []
      for (const edge of siblings) {
        if (neighborsTokenCount >= tokenLimit) break
        if (edge.name && edge.node && edge.node.message?.payload) {
          const [siblingValue] = edge.node.message.payload.format(edge.node.type)
          if (siblingValue !== null && siblingValue !== undefined) {
            if (!addNeighbor(edge.name, siblingValue, edge.node.type)) {
              break
            }
          }
        }
      }
    }
    
    // Get children
    if (topic.edgeCollection?.edges && neighborsTokenCount < tokenLimit) {
      const children = topic.edgeCollection.edges || []
      for (const edge of children) {
        if (neighborsTokenCount >= tokenLimit) break
        if (edge.name && edge.node && edge.node.message?.payload) {
          const [childValue] = edge.node.message.payload.format(edge.node.type)
          if (childValue !== null && childValue !== undefined) {
            if (!addNeighbor(edge.name, childValue, edge.node.type)) {
              break
            }
          }
        }
      }
    }
    
    if (neighbors.length > 0) {
      context.push(`\nRelated Topics (${neighbors.length} shown):`)
      context.push(neighbors.join('\n'))
    }
    
    // Add metadata
    if (topic.messages) {
      context.push(`\nMessage Count: ${topic.messages}`)
    }
    
    if (topic.childTopicCount) {
      const childCount = topic.childTopicCount()
      if (childCount > 0) {
        context.push(`Subtopics: ${childCount}`)
      }
    }
    
    return context.join('\n')
  }

  /**
   * Send a message to the LLM and get a response
   */
  public async sendMessage(userMessage: string, topicContext?: string): Promise<string> {
    try {
      // Add topic context if provided
      let messageContent = userMessage
      if (topicContext) {
        messageContent = `Context:\n${topicContext}\n\nUser Question: ${userMessage}`
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: messageContent,
      })

      let assistantMessage: string

      if (this.provider === 'gemini') {
        // Gemini API format
        const apiKey = this.getApiKeyFromStorage()
        const contents = this.conversationHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          }))

        // Prepend system message as first user message for Gemini
        const systemMsg = this.conversationHistory.find(msg => msg.role === 'system')
        if (systemMsg && contents.length > 0) {
          contents[0].parts.unshift({ text: systemMsg.content })
        }

        const response = await this.axiosInstance.post(
          `/models/${this.model}:generateContent?key=${apiKey}`,
          {
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }
        )

        if (!response.data.candidates || response.data.candidates.length === 0) {
          throw new Error('No response from AI assistant')
        }

        assistantMessage = response.data.candidates[0].content.parts[0].text
      } else {
        // OpenAI API format
        const response = await this.axiosInstance.post('/chat/completions', {
          model: this.model,
          messages: this.conversationHistory,
          temperature: 0.7,
          max_tokens: 500,
        })

        if (!response.data.choices || response.data.choices.length === 0) {
          throw new Error('No response from AI assistant')
        }

        assistantMessage = response.data.choices[0].message.content
      }
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      })

      // Keep conversation history manageable (last 10 messages + system)
      if (this.conversationHistory.length > 11) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-10), // Keep last 10 messages
        ]
      }

      return assistantMessage
    } catch (error: unknown) {
      console.error('LLM Service Error:', error)
      
      const err = error as { response?: { status?: number; data?: any }; code?: string; message?: string }
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw new Error('Invalid API key. Please check your configuration.')
      } else if (err.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else if (err.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.')
      } else {
        throw new Error(err.message || 'Failed to get response from AI assistant.')
      }
    }
  }

  /**
   * Clear conversation history
   */
  public clearHistory(): void {
    this.conversationHistory = [this.conversationHistory[0]] // Keep only system message
  }

  /**
   * Get quick suggestions based on topic
   */
  public getQuickSuggestions(topic: { message?: { payload?: any }; childTopicCount?: () => number; messages?: number }): string[] {
    const suggestions = []
    
    if (topic.message?.payload) {
      suggestions.push('Explain this data structure')
      suggestions.push('What does this value mean?')
    }
    
    if (topic.childTopicCount && topic.childTopicCount() > 0) {
      suggestions.push('Summarize all subtopics')
    }
    
    if (topic.messages > 1) {
      suggestions.push('Analyze message patterns')
    }
    
    suggestions.push('What can I do with this topic?')
    
    return suggestions
  }
}

// Export a singleton instance
let llmServiceInstance: LLMService | null = null

export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService()
  }
  return llmServiceInstance
}

export function resetLLMService(): void {
  llmServiceInstance = null
}
