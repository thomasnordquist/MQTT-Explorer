/**
 * LLM Service for interacting with topics
 * Provides AI assistance to help users understand and interact with MQTT topics
 */

import { RpcEvents } from '../../../events/EventsV2'

// Import backendRpc conditionally to avoid socket.io-client in test environment
let backendRpc: any
try {
  const browserEventBus = require('../browserEventBus')
  backendRpc = browserEventBus.backendRpc
} catch (e) {
  // In test environment, socket.io-client may not be available
  // backendRpc will be undefined, which is fine for tests that don't use it
  backendRpc = undefined
}

// Topic node interface for type safety
export interface TopicNode {
  path?: () => string
  message?: any
  messages?: number
  childTopicCount?: () => number
  type?: string
  parent?: any
  edgeCollection?: {
    edges?: Array<{
      name?: string
      node?: TopicNode
    }>
  }
}

// Extend Window interface to include LLM availability flag
declare global {
  interface Window {
    __llmAvailable?: boolean
  }
}

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

export interface MessageProposal {
  topic: string
  payload: string
  qos: 0 | 1 | 2
  description: string
}

export interface QuestionProposal {
  question: string
  category?: string // 'analysis', 'control', 'troubleshooting', 'optimization'
}

export interface LLMResponse {
  response: string
  debugInfo?: any
}

export interface ParsedResponse {
  text: string
  proposals: MessageProposal[]
  questions: QuestionProposal[]
  debugInfo?: any // Debug information from API call
}

export class LLMService {
  private conversationHistory: LLMMessage[] = []

  private neighboringTopicsTokenLimit: number

  constructor(config: LLMServiceConfig = {}) {
    // In new architecture, we don't need API key or provider on client
    // Backend handles all LLM API calls
    this.neighboringTopicsTokenLimit =
      config.neighboringTopicsTokenLimit || this.getNeighboringTopicsTokenLimitFromEnv() || 500

    // Initialize with system message that sets MQTT and automation context
    this.conversationHistory.push({
      role: 'system',
      content: `You are an expert AI assistant specializing in MQTT (Message Queuing Telemetry Transport) protocol and home/industrial automation systems.

**Your Core Expertise:**
- MQTT protocol: topics, QoS levels, retained messages, wildcards, last will and testament
- IoT and smart home ecosystems: devices, sensors, actuators, and controllers
- Home automation platforms: Home Assistant, openHAB, Node-RED, MQTT brokers, zigbee2mqtt, tasmota
- Common MQTT topic patterns and naming conventions (e.g., zigbee2mqtt, tasmota, homie)
- Data formats: JSON payloads, binary data, sensor readings, state messages
- Time-series data analysis and pattern recognition
- Troubleshooting connectivity, message delivery, and data quality issues

**Your Communication Style:**
- Keep your TEXT response CONCISE and practical (2-3 sentences maximum for the explanation)
- Use clear technical language appropriate for users familiar with MQTT
- When analyzing data, identify patterns, anomalies, or potential issues quickly
- Suggest practical next steps or automations when relevant
- Reference common MQTT ecosystems and standards when applicable
- NOTE: Proposals and question suggestions are OUTSIDE the sentence limit - always include them when relevant

**Context You Receive:**
Users will ask about specific MQTT topics and their data. You'll receive:
- Topic path (the MQTT topic hierarchy)
- Current value and message payload
- Related/neighboring topics with their values
- Metadata (message count, subtopics, retained status)

**Actionable Proposals:**
When you detect home automation systems (Home Assistant, zigbee2mqtt, tasmota, homie, etc.) or controllable devices, you should ALWAYS propose MQTT messages that users can send. Include proposals regardless of response length.
To propose an action, include a JSON block in your response with this exact format:

\`\`\`proposal
{
  "topic": "the/mqtt/topic",
  "payload": "message payload",
  "qos": 0,
  "description": "Brief description of what this does"
}
\`\`\`

You can include multiple proposals if there are multiple relevant actions. Always propose actions when you detect controllable devices.

**Follow-Up Questions:**
After answering, suggest 1-3 relevant follow-up questions to help users explore further. Use this format:

\`\`\`question-proposal
{
  "question": "Your suggested question here?",
  "category": "analysis"
}
\`\`\`

Categories: "analysis" (understanding data), "control" (device actions), "troubleshooting" (problems), "optimization" (improvements).

**Your Goal:**
Help users understand their MQTT data, troubleshoot issues, optimize their automation setups, and discover insights about their connected devices. Provide concise, actionable responses.`,
    })
  }

  private getNeighboringTopicsTokenLimitFromEnv(): number | undefined {
    // Fallback to process.env (only works in Electron/Node.js context)
    if (typeof process !== 'undefined' && process.env) {
      const limit = parseInt(process.env.LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT || '', 10)
      return isNaN(limit) ? undefined : limit
    }
    return undefined
  }

  /**
   * Check if LLM service is available (backend has API key configured)
   */
  public hasApiKey(): boolean {
    // In new architecture, check if backend has LLM service available
    if (typeof window !== 'undefined' && window.__llmAvailable !== undefined) {
      return window.__llmAvailable
    }
    // Default to false if not set (feature hidden until server confirms)
    return false
  }

  /**
   * Get the system message (for debugging purposes)
   */
  public getSystemMessage(): string {
    return this.conversationHistory[0]?.content || ''
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
   * Returns object with truncated text and flag indicating if truncation occurred
   */
  private truncateToTokenLimit(text: string, tokenLimit: number): { text: string; truncated: boolean } {
    const estimatedTokens = this.estimateTokens(text)
    if (estimatedTokens <= tokenLimit) {
      return { text, truncated: false }
    }

    // Truncate to approximate character count
    const maxChars = tokenLimit * 4
    if (text.length <= maxChars) {
      return { text, truncated: false }
    }

    return {
      text: `${text.substring(0, maxChars - 3)}...`,
      truncated: true,
    }
  }

  /**
   * Escape string for single-line representation (no newlines)
   * Encodes newlines and other special characters similar to JSON string encoding
   */
  private escapeToSingleLine(text: string): string {
    return text
      .replace(/\\/g, '\\\\') // Escape backslashes first
      .replace(/\n/g, '\\n') // Encode newlines
      .replace(/\r/g, '\\r') // Encode carriage returns
      .replace(/\t/g, '\\t') // Encode tabs
      .replace(/"/g, '\\"') // Escape quotes
  }

  /**
   * Format value for LLM context (machine-friendly, single-line)
   */
  private formatValueForContext(value: any, tokenLimit: number, markTruncation: boolean = true): string {
    let valueStr: string

    if (typeof value === 'object' && value !== null) {
      // For objects, use JSON.stringify which handles escaping
      valueStr = JSON.stringify(value)
    } else {
      valueStr = String(value)
    }

    // Escape to single line
    const escaped = this.escapeToSingleLine(valueStr)

    // Truncate if needed
    const result = this.truncateToTokenLimit(escaped, tokenLimit)

    if (result.truncated && markTruncation) {
      return `[TRUNCATED] ${result.text}`
    }

    return result.text
  }

  /**
   * Generate context from topic data including neighboring topics
   * Provides hierarchical context with parent, siblings, children, grandchildren, and cousins
   */
  public generateTopicContext(topic: TopicNode): string {
    const context = []

    if (topic.path) {
      context.push(`Topic: ${topic.path()}`)
    }

    // Add current value with preview (allow more tokens for main topic - 200 tokens)
    if (topic.message?.payload) {
      const [value] = topic.message.payload.format(topic.type)
      if (value !== null && value !== undefined) {
        // Main topic value can contain newlines, format for LLM
        const formattedValue = this.formatValueForContext(value, 200, true)
        context.push(`Value: ${formattedValue}`)
      }

      // Add retained status if true
      if (topic.message.retain) {
        context.push('Retained: true')
      }
    }

    // Add neighboring topics with expanded scope (parent, siblings, children, grandchildren, cousins)
    // Full topic paths with single-line previews
    const neighbors: string[] = []
    let neighborsTokenCount = 0
    const tokenLimit = this.neighboringTopicsTokenLimit

    // Helper function to add a neighbor if within token limit
    // Increased from 20 to 30 tokens per neighbor for better value previews
    const addNeighbor = (fullPath: string, value: any, tokenAllocation: number = 30): boolean => {
      // Format value as single-line preview (no newlines)
      const preview = this.formatValueForContext(value, tokenAllocation, false)
      const neighborEntry = `  ${fullPath}: ${preview}`
      const tokens = this.estimateTokens(neighborEntry)

      if (neighborsTokenCount + tokens <= tokenLimit) {
        neighbors.push(neighborEntry)
        neighborsTokenCount += tokens
        return true
      }
      return false
    }

    // Priority 1: Add parent topic value (for hierarchical context)
    if (topic.parent && topic.parent.message?.payload && neighborsTokenCount < tokenLimit) {
      const [parentValue] = topic.parent.message.payload.format(topic.parent.type)
      if (parentValue !== null && parentValue !== undefined && topic.parent.path) {
        addNeighbor(topic.parent.path(), parentValue, 30)
      }
    }

    // Get parent path for constructing full paths
    const parentPath = topic.parent?.path ? topic.parent.path() : ''

    // Priority 2: Get siblings from parent (same level as current topic)
    if (topic.parent && topic.parent.edgeCollection) {
      const siblings = topic.parent.edgeCollection.edges || []
      for (const edge of siblings) {
        if (neighborsTokenCount >= tokenLimit) break
        if (edge.name && edge.node && edge.node.message?.payload) {
          const [siblingValue] = edge.node.message.payload.format(edge.node.type)
          if (siblingValue !== null && siblingValue !== undefined) {
            const fullPath = parentPath ? `${parentPath}/${edge.name}` : edge.name
            if (!addNeighbor(fullPath, siblingValue)) {
              break
            }
          }
        }
      }
    }

    // Priority 3: Get children (direct children of current topic)
    const currentPath = topic.path ? topic.path() : ''
    const childNodes: Array<{ name: string; node: TopicNode }> = []
    if (topic.edgeCollection?.edges && neighborsTokenCount < tokenLimit) {
      const children = topic.edgeCollection.edges || []
      for (const edge of children) {
        if (neighborsTokenCount >= tokenLimit) break
        if (edge.name && edge.node && edge.node.message?.payload) {
          const [childValue] = edge.node.message.payload.format(edge.node.type)
          if (childValue !== null && childValue !== undefined) {
            const fullPath = currentPath ? `${currentPath}/${edge.name}` : edge.name
            if (!addNeighbor(fullPath, childValue)) {
              break
            }
            // Store child nodes for grandchildren traversal
            if (edge.node) {
              childNodes.push({ name: edge.name, node: edge.node })
            }
          }
        }
      }
    }

    // Priority 4: Get grandchildren (children's children, 2 levels deep)
    for (const child of childNodes) {
      if (neighborsTokenCount >= tokenLimit) break
      if (child.node.edgeCollection?.edges) {
        const grandchildren = child.node.edgeCollection.edges || []
        for (const edge of grandchildren) {
          if (neighborsTokenCount >= tokenLimit) break
          if (edge.name && edge.node && edge.node.message?.payload) {
            const [grandchildValue] = edge.node.message.payload.format(edge.node.type)
            if (grandchildValue !== null && grandchildValue !== undefined) {
              const fullPath = currentPath ? `${currentPath}/${child.name}/${edge.name}` : `${child.name}/${edge.name}`
              if (!addNeighbor(fullPath, grandchildValue)) {
                break
              }
            }
          }
        }
      }
    }

    // Priority 5: Get cousins (siblings' children) when space available
    if (topic.parent && topic.parent.edgeCollection && neighborsTokenCount < tokenLimit) {
      const siblings = topic.parent.edgeCollection.edges || []
      for (const sibling of siblings) {
        if (neighborsTokenCount >= tokenLimit) break
        if (sibling.node && sibling.node.edgeCollection?.edges) {
          const cousinEdges = sibling.node.edgeCollection.edges || []
          for (const edge of cousinEdges) {
            if (neighborsTokenCount >= tokenLimit) break
            if (edge.name && edge.node && edge.node.message?.payload) {
              const [cousinValue] = edge.node.message.payload.format(edge.node.type)
              if (cousinValue !== null && cousinValue !== undefined) {
                const fullPath = parentPath
                  ? `${parentPath}/${sibling.name}/${edge.name}`
                  : `${sibling.name}/${edge.name}`
                if (!addNeighbor(fullPath, cousinValue, 25)) {
                  // Slightly lower token allocation for cousins
                  break
                }
              }
            }
          }
        }
      }
    }

    if (neighbors.length > 0) {
      context.push(`\nRelated Topics (${neighbors.length}):`)
      context.push(neighbors.join('\n'))
    }

    // Add metadata
    if (topic.messages) {
      context.push(`\nMessages: ${topic.messages}`)
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
   * Messages are proxied through the backend server via WebSocket for security
   */
  public async sendMessage(userMessage: string, topicContext?: string): Promise<LLMResponse> {
    try {
      // Add topic context if provided
      let messageContent = userMessage
      if (topicContext) {
        messageContent = `Context:\n${topicContext}\n\nUser Question: ${userMessage}`
        console.log('LLM Service: Topic context added to message')
        console.log('Context length:', topicContext.length, 'characters')
        console.log('Context preview:', topicContext.substring(0, 200) + '...')
      } else {
        console.log('LLM Service: No topic context provided')
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: messageContent,
      })
      
      console.log('LLM Service: User message added to history')
      console.log('Message content length:', messageContent.length, 'characters')
      console.log('Message preview:', messageContent.substring(0, 300) + '...')

      // Call backend via RPC (WebSocket) instead of HTTP
      const result = await backendRpc.call(RpcEvents.llmChat, {
        messages: this.conversationHistory,
        topicContext,
      })

      console.log('LLM Service: Received result from backend:', result)
      console.log('LLM Service: Has response:', !!result?.response)
      console.log('LLM Service: Has debugInfo:', !!result?.debugInfo)

      if (!result || !result.response) {
        console.error('LLM Service: Invalid result from backend:', result)
        throw new Error('No response from AI assistant')
      }

      const assistantMessage = result.response
      const debugInfo = result.debugInfo
      
      console.log('LLM Service: Assistant message length:', assistantMessage.length)
      console.log('LLM Service: Debug info:', debugInfo)

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

      return {
        response: assistantMessage,
        debugInfo,
      }
    } catch (error: unknown) {
      console.error('LLM Service Error:', error)

      const err = error as { message?: string }

      // Error messages come from RPC handler
      throw new Error(err.message || 'Failed to get response from AI assistant.')
    }
  }

  /**
   * Parse LLM response to extract proposals, questions, and clean text
   */
  public parseResponse(response: string): ParsedResponse {
    const proposals: MessageProposal[] = []
    const questions: QuestionProposal[] = []
    let cleanText = response

    // Match proposal blocks: ```proposal\n{...}\n```
    const proposalRegex = /```proposal\s*\n([\s\S]*?)\n```/g
    let match

    while ((match = proposalRegex.exec(response)) !== null) {
      try {
        const proposalJson = JSON.parse(match[1])
        if (proposalJson.topic && proposalJson.payload !== undefined && proposalJson.description) {
          proposals.push({
            topic: proposalJson.topic,
            payload: proposalJson.payload,
            qos: proposalJson.qos || 0,
            description: proposalJson.description,
          })
        }
      } catch (e) {
        console.warn('Failed to parse proposal:', match[1])
      }
    }

    // Match question proposal blocks: ```question-proposal\n{...}\n```
    const questionRegex = /```question-proposal\s*\n([\s\S]*?)\n```/g
    while ((match = questionRegex.exec(response)) !== null) {
      try {
        const questionJson = JSON.parse(match[1])
        if (questionJson.question) {
          questions.push({
            question: questionJson.question,
            category: questionJson.category,
          })
        }
      } catch (e) {
        console.warn('Failed to parse question proposal:', match[1])
      }
    }

    // Remove proposal and question blocks from display text
    cleanText = cleanText.replace(/```proposal\s*\n[\s\S]*?\n```/g, '').trim()
    cleanText = cleanText.replace(/```question-proposal\s*\n[\s\S]*?\n```/g, '').trim()

    return { text: cleanText, proposals, questions }
  }

  /**
   * Generate suggested questions for a topic using LLM
   */
  public async generateSuggestedQuestions(topic: TopicNode): Promise<string[]> {
    try {
      const topicContext = this.generateTopicContext(topic)

      // Sanitize context to prevent prompt injection
      // Remove any potential instruction-like phrases that could manipulate the LLM
      const sanitizedContext = topicContext
        .replace(/```/g, '｀｀｀') // Replace backticks to prevent code block escape
        .replace(/system:|assistant:|user:/gi, '') // Remove role markers
        .slice(0, 2000) // Limit context length

      // Create a temporary conversation for question generation
      const questionPrompt = `Based on this MQTT topic and its context, suggest 3-5 brief, relevant questions a user might want to ask. Return ONLY a JSON array of question strings, nothing else.

Context:
${sanitizedContext}

Format: ["question 1", "question 2", "question 3"]`

      const response = await backendRpc.call(RpcEvents.llmChat, {
        messages: [
          this.conversationHistory[0], // System message
          { role: 'user', content: questionPrompt },
        ],
      })

      if (!response || !response.response) {
        return []
      }

      // Try to parse JSON array from response
      try {
        // Extract JSON array from response (might have markdown or extra text)
        const jsonMatch = response.response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0])
          if (Array.isArray(questions)) {
            return questions.slice(0, 5) // Max 5 questions
          }
        }
      } catch (e) {
        console.warn('Failed to parse suggested questions:', e)
      }

      return []
    } catch (error) {
      console.error('Error generating suggested questions:', error)
      return []
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
  public getQuickSuggestions(topic: TopicNode): string[] {
    const suggestions = []

    if (topic.message?.payload) {
      suggestions.push('Explain this data structure')
      suggestions.push('What does this value mean?')
    }

    if (topic.childTopicCount && topic.childTopicCount() > 0) {
      suggestions.push('Summarize all subtopics')
    }

    if (topic.messages && topic.messages > 1) {
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
