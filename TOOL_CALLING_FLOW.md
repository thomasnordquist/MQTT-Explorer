# Tool Calling Communication Flow

## Overview

This document explains the complete communication flow for the LLM tool calling system in MQTT Explorer, including where information comes from and how it flows through the system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Browser)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AIAssistant.tsx (UI Component)                       │   │
│  │  - User input/output                                  │   │
│  │  - Message display                                    │   │
│  │  - Tool action display                                │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐  │
│  │  llmService.ts (Frontend Service)                     │  │
│  │  - Conversation management                            │  │
│  │  - Tool execution (LOCAL)                             │  │
│  │  - Topic tree access                                  │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐  │
│  │  Topic Tree (TreeNode)                                │  │
│  │  - MQTT messages                                      │  │
│  │  - Topic hierarchy                                    │  │
│  │  - Message history                                    │  │
│  │  SOURCE OF ALL MQTT DATA                              │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ WebSocket RPC
                       │ (No MQTT data sent!)
┌──────────────────────▼───────────────────────────────────────┐
│                      Backend (Node.js Server)                 │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  server.ts - llmChat RPC Handler                      │   │
│  │  - Receives messages from frontend                    │   │
│  │  - Defines tools (schemas only)                       │   │
│  │  - Proxies to LLM API                                 │   │
│  │  - Returns responses                                  │   │
│  └──────────────────────┬────────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼────────────────────────────────┐   │
│  │  LLMApiClient.ts                                      │   │
│  │  - OpenAI/Gemini API calls                            │   │
│  │  - Tool definition formatting                         │   │
│  │  - Response parsing                                   │   │
│  └──────────────────────┬────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼─────────────────────────────────────┐
│                    External LLM API                           │
│              (OpenAI gpt-5-mini / Gemini)                     │
│  - Receives messages + tool definitions                       │
│  - Decides when to use tools                                  │
│  - Generates responses                                        │
└───────────────────────────────────────────────────────────────┘
```

## Complete Communication Flow

### Step 1: User Initiates Chat

**Location:** `app/src/components/Sidebar/AIAssistant.tsx`

```typescript
// User types message and clicks send
const handleSendMessage = async () => {
  const message = inputValue.trim()
  
  // Call llmService
  const llmResponse = await llmService.sendMessage(
    message,
    topicContext,  // Current topic info (if any)
    node,          // Current TreeNode (MQTT topic tree)
    onToolCallsStarted  // Callback for live tool display
  )
}
```

**Data passed:**
- `message`: User's question
- `topicContext`: Optional context about currently selected topic
- `node`: TreeNode object containing ENTIRE MQTT topic tree
- `onToolCallsStarted`: Callback to show tool actions in UI

### Step 2: Frontend Prepares Request

**Location:** `app/src/services/llmService.ts` (sendMessage method)

```typescript
// Add topic context to message if provided
let messageContent = userMessage
if (topicContext) {
  messageContent = `Context:\n${topicContext}\n\nUser Question: ${userMessage}`
}

// Add to conversation history
this.conversationHistory.push({
  role: 'user',
  content: messageContent,
})
```

**What happens:**
- Message context added (e.g., "Currently viewing: kitchen/coffee_maker")
- Added to conversation history
- History includes system prompt with tool usage instructions

### Step 3: Frontend → Backend RPC Call

**Location:** `app/src/services/llmService.ts`

```typescript
// Call backend via RPC (WebSocket)
let result = await backendRpc.call(RpcEvents.llmChat, {
  messages: this.conversationHistory,  // All messages including system prompt
  topicContext,                         // Optional topic context
})
```

**What's sent to backend:**
- Conversation history (system prompt + user messages)
- Topic context string (NOT the topic tree data)
- NO MQTT data is sent to backend

### Step 4: Backend Receives Request

**Location:** `src/server.ts` (llmChat RPC handler)

```typescript
[RpcEvents.llmChat]: async (req: LlmChatRequest) => {
  const { messages, topicContext, toolResults } = req
  
  // Log request
  console.log('LLM RPC - Received request')
  console.log('Messages:', messages.length)
  console.log('Topic context:', !!topicContext)
  
  // Define tools...
}
```

**What backend knows:**
- User messages
- Topic context (as text, not data)
- Previous tool results (if any)
- **Backend does NOT have access to MQTT topic tree**

### Step 5: Backend Defines Tools

**Location:** `src/server.ts`

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'query_topic_history',
      description: 'Get recent message history for an MQTT topic',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic path' },
          limit: { type: 'number', description: 'Max messages (default 10, max 20)' }
        },
        required: ['topic']
      }
    }
  },
  // ... get_topic, list_children, list_parents
]
```

**Important:**
- Tools are defined as SCHEMAS only
- Backend doesn't implement tool logic
- Backend just tells LLM these tools exist

### Step 6: Backend → OpenAI API Call

**Location:** `src/server.ts` via `backend/src/llmApiClient.ts`

```typescript
const llmClient = new LLMApiClient({
  apiKey,
  provider: envProvider,
  maxTokens: 1000,
  tools,  // Tool definitions
})

const apiResponse = await llmClient.chat(messages)
```

**What's sent to OpenAI:**
- All messages in conversation
- Tool definitions (4 tools)
- Model: gpt-5-mini
- Max tokens: 1000

### Step 7: OpenAI Processes Request

**What OpenAI does:**
1. Reads conversation history
2. Understands user question
3. Sees tool definitions
4. Decides if tools are needed
5. **Either:**
   - Returns text response (if no tools needed)
   - Returns tool_calls array (if tools needed)

**Example tool call response:**
```json
{
  "tool_calls": [
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "list_children",
        "arguments": "{\"topic\": \"kitchen\", \"limit\": 20}"
      }
    }
  ]
}
```

### Step 8: Backend → Frontend Returns Response

**Location:** `src/server.ts`

```typescript
return {
  response: apiResponse.content,      // Text response (may be empty if tools requested)
  toolCalls: apiResponse.toolCalls,   // Array of tool calls (if any)
  debugInfo,                           // Timing, usage stats
}
```

**What frontend receives:**
- `response`: LLM's text (empty if tool calls requested)
- `toolCalls`: Array of tools LLM wants to use
- `debugInfo`: Metadata about the request

### Step 9: Frontend Checks for Tool Calls

**Location:** `app/src/services/llmService.ts` (sendMessage method)

```typescript
// If LLM requested tool calls, execute them
if (toolCalls && toolCalls.length > 0) {
  // Notify UI (show "Thinking" with tool actions)
  if (onToolCallsStarted) {
    onToolCallsStarted(toolCalls)
  }
  
  // Execute tools...
}
```

**What happens if tool calls exist:**
- UI shows "Thinking" with human-readable actions
- Frontend prepares to execute tools
- Tools will run LOCALLY on frontend

### Step 10: Frontend Finds Root Node

**Location:** `app/src/services/llmService.ts`

```typescript
// Find the root node for tool execution
const rootNode = this.findRootNode(currentNode)

// findRootNode implementation
private findRootNode(node?: TopicNode): TopicNode | null {
  if (!node) return null
  
  let current = node
  while (current.parent) {
    current = current.parent  // Traverse up to root
  }
  return current
}
```

**Why this is important:**
- Tools need to search ENTIRE topic tree, not just from current node
- If user is viewing "kitchen/coffee_maker/heater", tools still need to find "living_room/lamp"
- Root node has access to all topics

### Step 11: Frontend Executes Tools

**Location:** `app/src/services/llmService.ts` (executeTool method)

```typescript
private async executeTool(toolCall: any, rootNode?: TopicNode): Promise<any> {
  const args = JSON.parse(toolCall.arguments)
  
  switch (toolCall.name) {
    case 'query_topic_history':
      content = this.queryTopicHistory(args.topic, args.limit || 10, rootNode)
      break
    case 'get_topic':
      content = this.getTopic(args.topic, rootNode)
      break
    case 'list_children':
      content = this.listChildren(args.topic, args.limit || 20, rootNode)
      break
    case 'list_parents':
      content = this.listParents(args.topic, rootNode)
      break
  }
  
  return {
    tool_call_id: toolCall.id,
    content: content,  // Actual MQTT data from topic tree
  }
}
```

**Tool execution details:**

**query_topic_history:**
```typescript
private queryTopicHistory(topicPath: string, limit: number, rootNode?: TopicNode): string {
  const node = this.findTopicNode(topicPath, rootNode)
  
  // Get messages from node's history buffer
  const messages = node.messageHistory.getAll()
  const recent = messages.slice(-Math.min(limit, 20))
  
  return recent.map(msg => 
    `[${msg.timestamp.toISOString()}] ${msg.payload}`
  ).join('\n')
}
```

**get_topic:**
```typescript
private getTopic(topicPath: string, rootNode?: TopicNode): string {
  const node = this.findTopicNode(topicPath, rootNode)
  
  return `Topic: ${topicPath}
Value: ${node.message?.payload || 'No value'}
Subtopics: ${node.childTopicCount?.() || 0}`
}
```

**list_children:**
```typescript
private listChildren(topicPath: string, limit: number, rootNode?: TopicNode): string {
  const node = this.findTopicNode(topicPath, rootNode)
  
  const children: string[] = []
  for (const edge of node.edgeCollection.edges) {
    const childPath = `${topicPath}/${edge.name}`
    const childCount = edge.node.childTopicCount?.() || 0
    children.push(`${childPath} (${childCount} subtopics)`)
  }
  
  return `Child topics (${children.length}):\n${children.join('\n')}`
}
```

**list_parents:**
```typescript
private listParents(topicPath: string, rootNode?: TopicNode): string {
  const node = this.findTopicNode(topicPath, rootNode)
  
  const parents: string[] = []
  let current = node.parent
  while (current && current.path) {
    parents.unshift(current.path())
    current = current.parent
  }
  
  return `Parent hierarchy:\n${parents.join(' → ')}`
}
```

### Step 12: Frontend Adds Tool Results to History

**Location:** `app/src/services/llmService.ts`

```typescript
// Add assistant message with tool_calls
this.conversationHistory.push({
  role: 'assistant',
  content: '',
  tool_calls: toolCalls,  // Original tool calls from OpenAI
})

// Add tool results
for (const toolResult of toolResults) {
  this.conversationHistory.push({
    role: 'tool',
    content: toolResult.content,  // ACTUAL MQTT data
    tool_call_id: toolResult.tool_call_id,
  })
}
```

**Conversation history now includes:**
1. System prompt
2. User message
3. Assistant message with tool_calls
4. Tool messages with ACTUAL MQTT data

### Step 13: Frontend → Backend (Second Call)

**Location:** `app/src/services/llmService.ts`

```typescript
// Call backend again with tool results
result = await backendRpc.call(RpcEvents.llmChat, {
  messages: this.conversationHistory,  // Now includes tool results!
  topicContext,
  toolResults,
})
```

**What's different this time:**
- Conversation includes tool results
- Backend will send these to OpenAI
- OpenAI will use tool results to generate final response

### Step 14: Backend → OpenAI (With Tool Results)

**Location:** `src/server.ts` → `backend/src/llmApiClient.ts`

```typescript
const apiResponse = await llmClient.chat(messages)
// messages now includes tool results
```

**What OpenAI sees:**
```
[
  {role: "system", content: "You are an MQTT assistant..."},
  {role: "user", content: "What's in the kitchen?"},
  {role: "assistant", content: "", tool_calls: [...]},
  {role: "tool", content: "Child topics (3):\nkitchen/coffee_maker\nkitchen/lamp\nkitchen/temperature", tool_call_id: "call_abc123"}
]
```

**OpenAI uses tool results to generate informed response:**
- Knows actual topics in kitchen
- Can reference specific devices
- Provides accurate information

### Step 15: Final Response to User

**Location:** `app/src/services/llmService.ts` → `AIAssistant.tsx`

```typescript
// Frontend receives final response
return {
  response: "The kitchen has 3 devices: coffee_maker, lamp, and temperature sensor",
  toolCalls: initialToolCalls,  // For UI display
  debugInfo,
}

// AIAssistant.tsx displays response
setMessages(prev => [...prev, {
  role: 'assistant',
  content: llmResponse.response,
  toolActions: ['📋 Listing children of kitchen'],
}])
```

## Data Sources

### 1. MQTT Topic Tree (Frontend Only)

**Where it lives:**
- `currentNode` parameter passed to `sendMessage()`
- TreeNode object in frontend memory
- Built from MQTT messages received by app

**What it contains:**
- `message`: Current value/payload
- `messageHistory`: RingBuffer of recent messages
- `edgeCollection.edges`: Array of child topics
- `parent`: Reference to parent node
- `path()`: Function returning topic path
- `childTopicCount()`: Number of children

**Example:**
```typescript
{
  path: () => "kitchen/coffee_maker",
  message: {
    payload: "{\"heater\":\"on\",\"temperature\":92.5}",
    timestamp: Date
  },
  messageHistory: RingBuffer([
    {payload: "{\"heater\":\"off\",...}", timestamp: ...},
    {payload: "{\"heater\":\"on\",...}", timestamp: ...},
  ]),
  edgeCollection: {
    edges: [
      {name: "heater", node: TreeNode},
      {name: "temperature", node: TreeNode},
      {name: "waterLevel", node: TreeNode}
    ]
  },
  parent: TreeNode,
  childTopicCount: () => 3
}
```

### 2. Tool Results (Computed from Topic Tree)

Tools extract and format data from the topic tree:

**query_topic_history:**
```
[2024-01-01T10:00:00.000Z] {"heater":"off"}
[2024-01-01T10:05:00.000Z] {"heater":"on"}
[2024-01-01T10:10:00.000Z] {"heater":"on","temperature":92.5}
```

**get_topic:**
```
Topic: kitchen/coffee_maker
Value: {"heater":"on","temperature":92.5}
Subtopics: 3
```

**list_children:**
```
Child topics (3):
✓ kitchen/coffee_maker/heater (0 subtopics)
✓ kitchen/coffee_maker/temperature (0 subtopics)
✓ kitchen/coffee_maker/waterLevel (0 subtopics)
```

**list_parents:**
```
Parent hierarchy:
kitchen
  kitchen/coffee_maker (current)
```

### 3. LLM Knowledge (OpenAI/Gemini)

**From system prompt:**
- MQTT expertise
- Tool usage instructions
- Format guidelines
- Home automation patterns

**From conversation:**
- User questions
- Previous responses
- Topic context
- Tool results (ACTUAL MQTT data)

## Multi-Round Tool Calling

The system supports multiple rounds of tool calls in a single conversation.

**Example:**

```
Round 1:
  LLM: Requests list_children("kitchen")
  Frontend: Executes, returns "coffee_maker, lamp, temperature"
  
Round 2:
  LLM: Now requests get_topic("kitchen/coffee_maker")
  Frontend: Executes, returns current value
  
Round 3:
  LLM: Generates final response using both tool results
```

**Implementation:**
```typescript
let maxToolRounds = 5
let toolRound = 0

while (toolRound < maxToolRounds) {
  toolRound++
  
  result = await backendRpc.call(RpcEvents.llmChat, {
    messages: this.conversationHistory,  // Includes previous tool results
  })
  
  if (result.response || !result.toolCalls) {
    break  // Done
  }
  
  // Execute new tool calls and add to history
  // Loop continues...
}
```

## Security Model

**API Key Protection:**
- ✅ API keys stored ONLY on backend (environment variables)
- ✅ Frontend NEVER sees API keys
- ✅ All LLM API calls proxied through backend

**Data Privacy:**
- ✅ MQTT topic data stays on frontend
- ✅ Only tool RESULTS sent to backend (not raw tree data)
- ✅ Tool results go to LLM API but controlled by user queries

**WebSocket Security:**
- ✅ RPC over WebSocket (not REST)
- ✅ Backend validates requests
- ✅ Frontend validates responses

## Error Handling

**No topic tree:**
```typescript
if (!currentNode) {
  return {
    response: 'Tool execution not available (no topic context)',
    toolCalls,
    debugInfo,
  }
}
```

**Topic not found:**
```typescript
const node = this.findTopicNode(topicPath, rootNode)
if (!node) {
  return `Topic not found: ${topicPath}`
}
```

**No children:**
```typescript
if (!node.edgeCollection?.edges || node.edgeCollection.edges.length === 0) {
  return `No child topics found for: ${topicPath}`
}
```

**Maximum tool rounds:**
```typescript
if (toolRound >= maxToolRounds) {
  console.warn('Reached maximum tool calling rounds')
}
```

## Troubleshooting

**Tool calls not appearing:**
- Check console: "LLM Service: Has toolCalls"
- Verify `onToolCallsStarted` callback is set
- Check if `pendingToolCalls` state is updated

**Tool execution fails:**
- Verify `currentNode` is passed to `sendMessage()`
- Check console for "Root node found"
- Verify topic tree is populated with data

**Empty tool results:**
- Check if topic exists in tree
- Verify topic path is correct (no wildcards)
- Check console logs for edge processing

**list_children returns no children:**
- Check if `node.edgeCollection.edges` exists
- Verify edges have `name` and `node` properties
- Check console: "Edge count"

## Summary

**Key Points:**

1. **Frontend owns all MQTT data** - Topic tree is local
2. **Backend is a proxy** - Just forwards to LLM API
3. **Tools execute on frontend** - Against local topic tree
4. **Security via proxy** - API keys stay on backend
5. **Multi-round supported** - LLM can gather information iteratively
6. **Tool results are real data** - From actual MQTT messages

**Communication is:**
- Frontend ↔ Backend: WebSocket RPC (no MQTT data in requests)
- Backend ↔ OpenAI: HTTPS (messages + tool results)
- Tools ↔ Topic Tree: Local function calls (frontend only)

The system is designed to keep MQTT data secure on the frontend while giving the LLM powerful querying capabilities through the tool calling mechanism.
