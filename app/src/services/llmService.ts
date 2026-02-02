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
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: any[] // For assistant messages that request tools
  tool_call_id?: string // For tool response messages
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
  toolCalls?: Array<{
    id: string
    function: {
      name: string
      arguments: string
    }
  }>
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
- Common MQTT systems: zigbee2mqtt, Home Assistant, Tasmota, ESPHome, Homie, Shelly, Tuya, and others
- Analyzing topic structures and patterns to infer system behavior
- Data formats: JSON payloads, binary data, sensor readings, state messages
- Time-series data analysis and pattern recognition
- Troubleshooting connectivity, message delivery, and data quality issues

**Your Communication Style:**
- Keep your TEXT response CONCISE and practical (2-3 sentences maximum for the explanation)
- Use clear technical language appropriate for users familiar with MQTT
- When analyzing data, identify patterns, anomalies, or potential issues quickly
- Suggest practical next steps or automations when relevant
- Reference the MQTT patterns you observe in the topic structure
- NOTE: Proposals and question suggestions are OUTSIDE the sentence limit - always include them when relevant

**Context You Receive:**
Users will ask about specific MQTT topics and their data. You'll receive:
- Topic path (the MQTT topic hierarchy)
- Current value and message payload
- Related/neighboring topics with their values
- Metadata (message count, subtopics, retained status)


**AVAILABLE TOOLS:**
You have access to powerful tools to query MQTT topic information:
1. **query_topic_history(topic, limit)** - Get recent message history for a topic to analyze patterns and trends
2. **get_topic(topic)** - Get detailed information about a specific topic including current value, message count, and metadata
3. **list_children(topic, limit)** - List child topics under a parent to explore the hierarchy and discover related devices
4. **list_parents(topic)** - Get the parent topic path hierarchy to understand the topic tree structure

**CRITICAL: Topic Path Requirements:**
- **Use EXACT topic paths as they appear** - match the format exactly
- Topics may or may not have leading slashes - both are valid in MQTT
  - "/home/test" and "home/test" are DIFFERENT topics (can coexist)
  - Use the exact format that matches the actual topic in the tree
- **NEVER use MQTT wildcards** (+ or #) in tool calls - they will NOT work
- Wildcards are for subscriptions only, NOT for querying existing topics
- To explore multiple topics, use list_children() first, then query each topic individually

**Examples:**
✅ CORRECT: get_topic("home/bedroom/lamp")       // topic without leading slash
✅ CORRECT: get_topic("/home/bedroom/lamp")      // topic WITH leading slash (if that's the actual topic)
✅ CORRECT: list_children("home/bedroom")
✅ CORRECT: list_children("/devices")            // topics can have leading slashes
❌ WRONG: get_topic("home/+/lamp") - wildcards don't work!
❌ WRONG: list_children("home/#") - wildcards don't work!

**When to use tools:**
- Use query_topic_history when you need to see how values changed over time
- Use get_topic to get details about a specific topic you haven't seen yet
- Use list_children to explore what topics exist under a parent path (then query specific children)
  - To list root-level topics, use list_children("") with an empty string
  - To list children of a specific topic, use list_children("path/to/topic")
- Use list_parents to understand the full path hierarchy of a topic

Use these tools **PROACTIVELY** to gather information **BEFORE making suggestions or answering questions**.

**USE TOOLS, DON'T ASK USERS TO DO IT:**
- If you need information about a topic, USE get_topic() or query_topic_history() - don't ask the user to check
- If you need to explore topics, USE list_children() or list_parents() - don't ask the user to navigate
- ALWAYS try to use available tools before asking the user to perform manual actions
- Tools are fast and provide accurate data - prefer using them over asking users to do manual work

**TRANSPARENCY - MENTION TOOLS USED:**
When you use tools to gather information, BRIEFLY mention it in your response to be transparent.
- ✅ Good: "I checked the current state using get_topic() and found..."
- ✅ Good: "Looking at the history with query_topic_history(), I see..."
- ✅ Good: "I explored the children topics and discovered..."
- ❌ Avoid: Long explanations about which tools you used
- Keep it natural and concise - just acknowledge the data source

**Actionable Proposals - IMPORTANT GUIDELINES:**
ONLY propose MQTT messages for CONTROLLABLE devices.
DO NOT propose messages for READ-ONLY sensors or status topics.
Be precise and specific - avoid generic or false positive proposals.
Only include proposals when you are confident they will work based on the patterns you observe.

When you detect a CONTROLLABLE device, propose MQTT messages using this exact format:

\`\`\`proposal
{
  "topic": "the/mqtt/topic",
  "payload": "message payload",
  "qos": 0,
  "description": "Brief description of what this does"
}
\`\`\`

**PATTERN ANALYSIS APPROACH:**
Infer the MQTT system and appropriate message format by analyzing:
- Topic naming patterns: Look for prefixes, suffixes, and hierarchical structure
- Related topics: If you see a /state or /status topic, look for a /set, /command, or /cmd topic
- Payload formats: Examine current values to determine if the system uses JSON objects or simple strings
- Value patterns: Study existing values to understand the expected format and valid values
- Common patterns: Control topics often mirror status topics with different suffixes or prefixes

What to look for when analyzing topics:
- Topics ending in /set, /command, /cmd typically accept control commands
- Topics with cmnd/ or command/ prefix often accept commands
- If current values are JSON objects, control topics likely expect JSON
- If current values are simple strings/numbers, match that format
- Look at neighboring topics to understand the data structure

For READ-ONLY sensors (topics without corresponding control topics):
- Explain what the sensor measures
- Describe how to monitor or visualize the data
- Do NOT propose control messages
- Acknowledge it's a read-only sensor

Quality over quantity - only propose actions you're confident will work based on observed patterns.

**Follow-Up Suggestions - IMPORTANT FORMAT:**
After answering, suggest 1-3 proactive actions YOU could perform that might interest the user.
Frame these as things YOU (the assistant) could do, not questions the user should ask.
**ALWAYS use the exact format below with backticks:**

\`\`\`question-proposal
{
  "question": "I could [action you could perform]",
  "category": "analysis"
}
\`\`\`

**Examples:**
- ✅ Good: "I could check the temperature history over the past hour"
- ✅ Good: "I could analyze the power consumption trends"
- ✅ Good: "I could find all sensors in the living room"
- ❌ Bad: "What is the temperature?" (don't ask questions)
- ❌ Bad: "Check the history" (don't instruct the user)

**Required:**
- Must include the \`\`\`question-proposal backticks
- Must be valid JSON inside the code block
- Phrase as "I could [action]" or "I could [verb] the [noun]"
- Categories: "analysis" (data exploration), "control" (device actions), "troubleshooting" (diagnostics), "optimization" (improvements)

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
   * Find a topic node by path
   */
  /**
   * Find the root node by traversing up the parent chain
   */
  private findRootNode(node?: TopicNode): TopicNode | null {
    if (!node) {
      return null
    }

    let current = node
    while (current.parent) {
      current = current.parent
    }
    return current
  }

  private findTopicNode(topicPath: string, currentNode?: TopicNode): TopicNode | null {
    if (!currentNode) {
      return null
    }

    // Use exact path matching - do NOT normalize to preserve topic name integrity
    const currentPath = currentNode.path?.() || ''

    console.log('findTopicNode: looking for', topicPath, 'at', currentPath)

    // If current node matches, return it
    if (currentPath === topicPath) {
      console.log('findTopicNode: FOUND match at', currentPath)
      return currentNode
    }

    // Search in children - only follow edges that are on the path to target
    if (currentNode.edgeCollection?.edges) {
      for (const edge of currentNode.edgeCollection.edges) {
        const edgeName = edge.name || (edge as any).topic
        const edgeNode = edge.node || (edge as any).target
        
        if (edgeNode && edgeName) {
          // Build the full path to this edge
          const edgePath = currentPath ? `${currentPath}/${edgeName}` : edgeName
          
          // Only recurse if this edge is on the path to our target
          // Either it IS the target, or the target starts with this path
          if (topicPath === edgePath || topicPath.startsWith(edgePath + '/')) {
            console.log('findTopicNode: Following edge', edgeName, 'path:', edgePath)
            const found = this.findTopicNode(topicPath, edgeNode)
            if (found) {
              return found
            }
          }
        }
      }
    }

    console.log('findTopicNode: Not found at', currentPath)
    return null
  }

  /**
   * Execute a tool call and return formatted result
   */
  private async executeTool(
    toolCall: { id: string; name: string; arguments: string },
    rootNode?: TopicNode
  ): Promise<{ tool_call_id: string; name: string; content: string }> {
    console.log('LLM Service: executeTool called')
    console.log('Tool ID:', toolCall.id)
    console.log('Tool name:', toolCall.name)
    console.log('Tool arguments:', toolCall.arguments)
    console.log('Has rootNode:', !!rootNode)
    
    try {
      const args = JSON.parse(toolCall.arguments)
      console.log('Parsed arguments:', args)
      
      let result: string

      switch (toolCall.name) {
        case 'query_topic_history':
          console.log('Executing query_topic_history for topic:', args.topic)
          result = this.queryTopicHistory(args.topic, args.limit || 10, rootNode)
          console.log('query_topic_history result length:', result.length)
          console.log('query_topic_history result preview:', result.substring(0, 200))
          break
        case 'get_topic':
          console.log('Executing get_topic for topic:', args.topic)
          result = this.getTopic(args.topic, rootNode)
          console.log('get_topic result length:', result.length)
          console.log('get_topic result preview:', result.substring(0, 200))
          break
        case 'list_children':
          console.log('Executing list_children for topic:', args.topic)
          result = this.listChildren(args.topic, args.limit || 20, rootNode)
          console.log('list_children result length:', result.length)
          console.log('list_children result preview:', result.substring(0, 200))
          break
        case 'list_parents':
          console.log('Executing list_parents for topic:', args.topic)
          result = this.listParents(args.topic, rootNode)
          console.log('list_parents result length:', result.length)
          console.log('list_parents result preview:', result.substring(0, 200))
          break
        default:
          console.error('Unknown tool requested:', toolCall.name)
          result = `Error: Unknown tool '${toolCall.name}'`
      }

      console.log('Tool execution complete. Returning result for', toolCall.name)
      return {
        tool_call_id: toolCall.id,
        name: toolCall.name,
        content: result,
      }
    } catch (error) {
      console.error('Error executing tool:', error)
      console.error('Error details:', {
        name: toolCall.name,
        arguments: toolCall.arguments,
        error: error instanceof Error ? error.message : String(error),
      })
      return {
        tool_call_id: toolCall.id,
        name: toolCall.name,
        content: `Error executing tool: ${error}`,
      }
    }
  }

  /**
   * Query topic history (200 token limit)
   */
  private queryTopicHistory(topicPath: string, limit: number, rootNode?: TopicNode): string {
    const node = rootNode ? this.findTopicNode(topicPath, rootNode) : null
    
    if (!node) {
      return `Topic not found: ${topicPath}`
    }

    // Get message history from node
    // Note: messageHistory is a RingBuffer with getAll() method
    const messageHistory = (node as any).messageHistory
    if (!messageHistory || !messageHistory.getAll) {
      return `No message history available for topic: ${topicPath}`
    }

    const messages = messageHistory.getAll()
    if (!messages || messages.length === 0) {
      return `No messages in history for topic: ${topicPath}`
    }

    // Get recent messages (up to limit, max 20)
    const recentMessages = messages.slice(-Math.min(limit, 20))
    
    // Format messages with timestamps
    const formatted = recentMessages.map((msg: any) => {
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toISOString() : 'unknown'
      const value = msg.payload ? msg.payload.toString() : 'null'
      return `[${timestamp}] ${value}`
    }).join('\n')

    // Limit to 200 tokens (~800 characters)
    const limited = this.truncateToTokenLimit(formatted, 200)
    return limited.truncated ? `${limited.text}\n[TRUNCATED - showing first 200 tokens]` : limited.text
  }

  /**
   * Get topic details (200 token limit)
   */
  private getTopic(topicPath: string, rootNode?: TopicNode): string {
    const node = rootNode ? this.findTopicNode(topicPath, rootNode) : null
    
    if (!node) {
      return `Topic not found: ${topicPath}`
    }

    const info: string[] = []
    info.push(`Topic: ${topicPath}`)

    // Current value
    if (node.message?.payload) {
      const [value] = node.message.payload.format(node.type)
      if (value !== null && value !== undefined) {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value)
        info.push(`Value: ${valueStr}`)
      }
      if (node.message.retain) {
        info.push('Retained: true')
      }
    }

    // Message count
    if (node.messages) {
      info.push(`Messages: ${node.messages}`)
    }

    // Child count
    if (node.childTopicCount) {
      const childCount = node.childTopicCount()
      if (childCount > 0) {
        info.push(`Subtopics: ${childCount}`)
      }
    }

    const result = info.join('\n')
    
    // Limit to 200 tokens
    const limited = this.truncateToTokenLimit(result, 200)
    return limited.truncated ? `${limited.text}\n[TRUNCATED]` : limited.text
  }

  /**
   * List child topics (200 token limit)
   */
  private listChildren(topicPath: string, limit: number, rootNode?: TopicNode): string {
    console.log('='.repeat(60))
    console.log('listChildren CALLED')
    console.log('  topicPath:', JSON.stringify(topicPath), '(type:', typeof topicPath, ')')
    console.log('  limit:', limit)
    console.log('  hasRootNode:', !!rootNode)
    if (rootNode) {
      console.log('  rootNode.path():', rootNode.path?.() || 'unknown')
    }
    
    // Special handling for root level (empty string or root)
    let node: TopicNode | null = null
    if (!topicPath || topicPath === '' || topicPath === '/' || topicPath.toLowerCase() === 'root') {
      console.log('  -> Treating as ROOT level query')
      node = rootNode || null
    } else {
      console.log('  -> Searching for topic:', topicPath)
      node = rootNode ? this.findTopicNode(topicPath, rootNode) : null
    }
    
    if (!node) {
      console.error('  ERROR: Topic node not found for path:', topicPath)
      console.error('  Is rootNode available?', !!rootNode)
      return `Topic not found: ${topicPath}. The topic may not exist in the MQTT tree.`
    }

    console.log('  Node FOUND at path:', node.path?.() || 'unknown')
    console.log('  Checking for children...')
    console.log('  Has edgeCollection:', !!node.edgeCollection)
    console.log('  Edge count:', node.edgeCollection?.edges?.length || 0)

    if (!node.edgeCollection?.edges || node.edgeCollection.edges.length === 0) {
      console.log('  -> No child topics (edges) found')
      const nodePath = node.path?.() || topicPath
      return `No child topics found under "${nodePath}". This topic has no sub-topics.`
    }

    console.log('  Processing edges...')
    const children: string[] = []
    const maxChildren = Math.min(limit, 50)
    const totalEdges = node.edgeCollection.edges.length
    console.log('  Total edges:', totalEdges, '| Processing up to:', maxChildren)
    
    for (let i = 0; i < Math.min(totalEdges, maxChildren); i++) {
      const edge = node.edgeCollection.edges[i]
      const edgeName = edge.name || (edge as any).topic
      const edgeNode = edge.node || (edge as any).target
      
      if (edgeName && edgeNode) {
        const childPath = topicPath ? `${topicPath}/${edgeName}` : edgeName
        const hasValue = edgeNode.message?.payload ? '✓' : '○'
        const childCount = edgeNode.childTopicCount?.() || 0
        const suffix = childCount > 0 ? ` (${childCount} subtopics)` : ''
        children.push(`${hasValue} ${childPath}${suffix}`)
        console.log(`  [${i+1}/${maxChildren}] Found child: ${edgeName}${suffix}`)
      } else {
        console.warn(`  [${i+1}/${maxChildren}] SKIP: Missing name or node:`, { 
          hasName: !!edgeName, 
          hasNode: !!edgeNode 
        })
      }
    }

    console.log('  RESULT: Found', children.length, 'valid children out of', totalEdges, 'edges')
    console.log('='.repeat(60))

    if (children.length === 0) {
      const nodePath = node.path?.() || topicPath
      return `No child topics found under "${nodePath}". The edges exist but have no valid names or nodes.`
    }

    const result = `Child topics (${children.length}):\n${children.join('\n')}`
    
    // Limit to 200 tokens
    const limited = this.truncateToTokenLimit(result, 200)
    return limited.truncated ? `${limited.text}\n[TRUNCATED - showing first 200 tokens]` : limited.text
  }

  /**
   * Get parent hierarchy (100 token limit)
   */
  private listParents(topicPath: string, rootNode?: TopicNode): string {
    const node = rootNode ? this.findTopicNode(topicPath, rootNode) : null
    
    if (!node) {
      return `Topic not found: ${topicPath}`
    }

    const parents: string[] = []
    let current = node.parent
    
    while (current && current.path) {
      const path = current.path()
      if (path) {
        parents.unshift(path)
      }
      current = current.parent
    }

    if (parents.length === 0) {
      return `No parent topics for: ${topicPath} (root level topic)`
    }

    const result = `Parent hierarchy:\n${parents.map((p, i) => `${' '.repeat(i * 2)}${p}`).join('\n')}\n${' '.repeat(parents.length * 2)}${topicPath} (current)`
    
    // Limit to 100 tokens
    const limited = this.truncateToTokenLimit(result, 100)
    return limited.truncated ? `${limited.text}\n[TRUNCATED]` : limited.text
  }

  /**
   * Send a message to the LLM and get a response
   * Messages are proxied through the backend server via WebSocket for security
   * Handles tool calls automatically
   */
  public async sendMessage(
    userMessage: string, 
    topicContext?: string, 
    currentNode?: TopicNode,
    onToolCallsStarted?: (toolCalls: any[]) => void
  ): Promise<LLMResponse> {
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

      // Call backend via RPC (WebSocket) - initial request
      let result = await backendRpc.call(RpcEvents.llmChat, {
        messages: this.conversationHistory,
        topicContext,
      })

      console.log('LLM Service: Received result from backend:', result)
      console.log('LLM Service: Has response:', !!result?.response)
      console.log('LLM Service: Has toolCalls:', !!result?.toolCalls)
      console.log('LLM Service: Has debugInfo:', !!result?.debugInfo)

      // Allow empty response if tool calls are present (LLM will respond after tools execute)
      if (!result || (!result.response && !result.toolCalls)) {
        console.error('LLM Service: Invalid result from backend:', result)
        throw new Error('No response from AI assistant')
      }

      let assistantMessage = result.response
      let debugInfo = result.debugInfo
      let toolCalls = result.toolCalls
      
      // Save the FIRST set of tool calls with results to show in UI
      // (subsequent rounds might have more tool calls, but showing the first set is most useful)
      const initialToolCallsWithResults: Array<{id: string, name: string, arguments: string, result?: string}> = []

      // If LLM requested tool calls, execute them and get final response
      if (toolCalls && toolCalls.length > 0) {
        // Notify UI that tool calls are being executed
        if (onToolCallsStarted) {
          onToolCallsStarted(toolCalls)
        }

        if (!currentNode) {
          console.warn('LLM Service: Tool calls requested but no currentNode provided')
          console.warn('LLM Service: Cannot execute tools without topic tree access')
          // Return what we have (empty response with tool calls for debugging)
          return {
            response: 'Tool execution not available (no topic context)',
            toolCalls: toolCalls.map((tc: any) => ({
              id: tc.id,
              name: tc.function?.name || tc.name,
              arguments: tc.function?.arguments || tc.arguments,
            })),
            debugInfo,
          }
        }

        console.log('LLM Service: Executing', toolCalls.length, 'tool calls')

        // Find the root node for tool execution
        // Tools need to search from root to find any topic, not just from currentNode
        const rootNode = this.findRootNode(currentNode)
        console.log('LLM Service: Root node found:', !!rootNode)
        if (rootNode) {
          console.log('LLM Service: Root node path:', rootNode.path?.() || 'unknown')
        }

        // Add assistant message with tool calls to history
        // OpenAI requires the tool_calls property to be included
        this.conversationHistory.push({
          role: 'assistant',
          content: assistantMessage || '', // Empty content is OK when there are tool calls
          tool_calls: toolCalls, // Include original tool calls
        })

        // Execute all tool calls and capture results for UI
        const toolResults = await Promise.all(
          toolCalls.map(async (tc: any) => {
            // Transform OpenAI tool call format to our format
            const toolCall = {
              id: tc.id,
              name: tc.function?.name || tc.name,
              arguments: tc.function?.arguments || tc.arguments,
            }
            const result = await this.executeTool(toolCall, rootNode || undefined)
            
            // Save tool call with its result for UI display
            initialToolCallsWithResults.push({
              id: toolCall.id,
              name: toolCall.name,
              arguments: toolCall.arguments,
              result: result.content,
            })
            
            return result
          })
        )

        console.log('LLM Service: Tool results:', toolResults)

        // Add tool results to history as tool messages
        for (const toolResult of toolResults) {
          this.conversationHistory.push({
            role: 'tool' as any,
            content: toolResult.content,
            tool_call_id: toolResult.tool_call_id, // Required by OpenAI
          })
        }

        // Call backend again with tool results
        // May need multiple rounds if LLM requests more tools
        let maxToolRounds = 5 // Prevent infinite loops
        let toolRound = 0
        
        while (toolRound < maxToolRounds) {
          toolRound++
          console.log(`LLM Service: Tool round ${toolRound}`)
          
          result = await backendRpc.call(RpcEvents.llmChat, {
            messages: this.conversationHistory,
            topicContext,
            toolResults,
          })

          console.log('LLM Service: Received result after tools:', result)

          if (!result) {
            console.error('LLM Service: No result from backend')
            throw new Error('No response from AI assistant')
          }

          assistantMessage = result.response
          debugInfo = result.debugInfo
          toolCalls = result.toolCalls

          // If we have a response or no more tool calls, we're done
          if (assistantMessage || !toolCalls || toolCalls.length === 0) {
            break
          }

          // LLM requested more tool calls
          console.log('LLM Service: LLM requested', toolCalls.length, 'more tool calls')

          // Add assistant message with tool calls to history
          this.conversationHistory.push({
            role: 'assistant',
            content: assistantMessage || '',
            tool_calls: toolCalls,
          })

          // Execute the new tool calls
          const newToolResults = await Promise.all(
            toolCalls.map((tc: any) => {
              const toolCall = {
                id: tc.id,
                name: tc.function?.name || tc.name,
                arguments: tc.function?.arguments || tc.arguments,
              }
              return this.executeTool(toolCall, rootNode || undefined)
            })
          )

          console.log('LLM Service: New tool results:', newToolResults)

          // Add new tool results to history
          for (const toolResult of newToolResults) {
            this.conversationHistory.push({
              role: 'tool' as any,
              content: toolResult.content,
              tool_call_id: toolResult.tool_call_id,
            })
          }
          
          // Continue loop to send these results back
        }

        if (toolRound >= maxToolRounds) {
          console.warn('LLM Service: Reached maximum tool calling rounds')
        }

        if (!assistantMessage) {
          console.error('LLM Service: No final response after all tool rounds')
          throw new Error('No final response from AI assistant')
        }
      }
      
      console.log('LLM Service: Assistant message length:', assistantMessage?.length || 0)
      console.log('LLM Service: Debug info:', debugInfo)

      // Add final assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage || '',
      })

      // Keep conversation history manageable (last 10 messages + system)
      if (this.conversationHistory.length > 11) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-10), // Keep last 10 messages
        ]
      }

      return {
        response: assistantMessage || '',
        toolCalls: initialToolCallsWithResults.length > 0 ? initialToolCallsWithResults : undefined, // Return tool calls with results
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

    // FALLBACK: Try to find bare JSON question proposals without backticks
    // This handles cases where LLM doesn't follow the ``` format
    // Look for patterns like: {"question": "...", "category": "..."}
    const bareQuestionRegex = /\{[\s\n]*"question"[\s\n]*:[\s\n]*"([^"]+)"[\s\n]*(?:,[\s\n]*"category"[\s\n]*:[\s\n]*"([^"]+)"[\s\n]*)?\}/g
    while ((match = bareQuestionRegex.exec(response)) !== null) {
      const fullMatch = match[0]
      const matchIndex = match.index
      
      // Check if this match is inside a ```question-proposal block
      // Find the nearest ``` before this match
      const textBefore = response.substring(0, matchIndex)
      const lastBacktickIndex = textBefore.lastIndexOf('```question-proposal')
      
      let isInsideBacktickBlock = false
      if (lastBacktickIndex !== -1) {
        // Check if there's a closing ``` after the opening and before our match
        const textBetween = response.substring(lastBacktickIndex, matchIndex)
        const closingBackticks = textBetween.substring(20).indexOf('```') // Skip the opening ```question-proposal
        if (closingBackticks === -1) {
          // No closing ``` found, so we're inside the block
          isInsideBacktickBlock = true
        }
      }
      
      // Only parse if not inside a backtick block (avoid duplicates)
      if (!isInsideBacktickBlock) {
        try {
          // Validate the JSON is properly formed
          const parsedJson = JSON.parse(fullMatch)
          if (parsedJson.question) {
            questions.push({
              question: parsedJson.question,
              category: parsedJson.category,
            })
            // Remove this bare JSON from display text
            cleanText = cleanText.replace(fullMatch, '').trim()
          }
        } catch (e) {
          // Not valid JSON, skip
        }
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
