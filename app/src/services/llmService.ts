/**
 * LLM Service for interacting with topics
 * Provides AI assistance to help users understand and interact with MQTT topics
 */

import axios, { AxiosInstance } from 'axios'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMServiceConfig {
  apiKey?: string
  apiEndpoint?: string
  model?: string
}

export class LLMService {
  private axiosInstance: AxiosInstance
  private model: string
  private conversationHistory: LLMMessage[] = []

  constructor(config: LLMServiceConfig = {}) {
    const apiKey = config.apiKey || this.getApiKeyFromStorage()
    const baseURL = config.apiEndpoint || 'https://api.openai.com/v1'
    this.model = config.model || 'gpt-3.5-turbo'

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
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

  /**
   * Save API key to local storage
   */
  public saveApiKey(apiKey: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('llm_api_key', apiKey)
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
   * Generate context from topic data
   */
  public generateTopicContext(topic: { path?: () => string; message?: any; messages?: number; childTopicCount?: () => number; type?: string }): string {
    const context = []
    
    if (topic.path) {
      context.push(`Topic Path: ${topic.path()}`)
    }
    
    if (topic.message) {
      context.push(`\nLatest Message:`)
      context.push(`- Timestamp: ${topic.message.received}`)
      context.push(`- QoS: ${topic.message.qos}`)
      context.push(`- Retained: ${topic.message.retain}`)
      
      if (topic.message.payload) {
        const [value] = topic.message.payload.format(topic.type)
        if (value !== null && value !== undefined) {
          context.push(`- Value: ${value}`)
        }
      }
    }
    
    if (topic.messages) {
      context.push(`\nMessage Count: ${topic.messages}`)
    }
    
    if (topic.childTopicCount) {
      const childCount = topic.childTopicCount()
      context.push(`Subtopics: ${childCount}`)
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

      // Call the API
      const response = await this.axiosInstance.post('/chat/completions', {
        model: this.model,
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
      })

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from AI assistant')
      }

      const assistantMessage = response.data.choices[0].message.content
      
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
      
      const err = error as { response?: { status?: number }; code?: string; message?: string }
      
      if (err.response?.status === 401) {
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
