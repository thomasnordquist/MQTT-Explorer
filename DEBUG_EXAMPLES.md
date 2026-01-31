# Debug Output Examples

This document shows examples of the enhanced debug output added to MQTT Explorer's AI Assistant.

## Frontend Debug View

Click the bug icon (🐛) in the AI Assistant header to toggle the debug view.

### Example Debug Output

```json
{
  "systemMessage": {
    "role": "system",
    "content": "You are an expert AI assistant specializing in MQTT (Message Queuing Telemetry Transport) protocol and home/industrial automation systems.\n\n**Your Core Expertise:**\n- MQTT protocol: topics, QoS levels, retained messages, wildcards, last will and testament\n- IoT and smart home ecosystems: devices, sensors, actuators, and controllers\n- Home automation platforms: Home Assistant, openHAB, Node-RED, MQTT brokers, zigbee2mqtt, tasmota\n- Common MQTT topic patterns and naming conventions (e.g., zigbee2mqtt, tasmota, homie)\n- Data formats: JSON payloads, binary data, sensor readings, state messages\n- Time-series data analysis and pattern recognition\n- Troubleshooting connectivity, message delivery, and data quality issues\n\n**Your Communication Style:**\n- Keep your TEXT response CONCISE and practical (2-3 sentences maximum for the explanation)\n- Use clear technical language appropriate for users familiar with MQTT\n- When analyzing data, identify patterns, anomalies, or potential issues quickly\n- Suggest practical next steps or automations when relevant\n- Reference common MQTT ecosystems and standards when applicable\n- NOTE: Proposals and question suggestions are OUTSIDE the sentence limit - always include them when relevant\n...",
    "note": "This is the system prompt that provides context to the LLM"
  },
  "messages": [
    {
      "index": 0,
      "role": "user",
      "content": "What does this topic do?",
      "fullContent": "Context:\nTopic: home/livingroom/light\nValue: {\"state\":\"ON\",\"brightness\":255}\nRetained: true\n\nRelated Topics (3):\n  home/livingroom/thermostat: 21.5\n  home/livingroom/motion: false\n  home/livingroom/light/set: \n\nMessages: 42\nSubtopics: 3\n\nUser Question: What does this topic do?",
      "timestamp": "2026-01-30T13:20:15.123Z",
      "proposals": 0,
      "questionProposals": 0,
      "apiDebug": {
        "provider": "openai",
        "model": "gpt-5-mini",
        "timing": {
          "duration_ms": 1234,
          "timestamp": "2026-01-30T13:20:15.123Z"
        },
        "request": {
          "url": "https://api.openai.com/v1/chat/completions",
          "body": {
            "model": "gpt-5-mini",
            "messages": [
              {
                "role": "system",
                "content": "You are an expert AI assistant..."
              },
              {
                "role": "user",
                "content": "Context:\nTopic: home/livingroom/light\n..."
              }
            ],
            "max_completion_tokens": 500
          }
        },
        "response": {
          "id": "chatcmpl-AbCdEfGh123456",
          "model": "gpt-5-mini",
          "created": 1738247815,
          "choices": [
            {
              "index": 0,
              "message": {
                "role": "assistant",
                "content": "This topic represents a smart light in your living room..."
              },
              "finish_reason": "stop"
            }
          ],
          "usage": {
            "prompt_tokens": 156,
            "completion_tokens": 98,
            "total_tokens": 254
          },
          "system_fingerprint": "fp_abc123def456"
        }
      }
    },
    {
      "index": 1,
      "role": "assistant",
      "content": "This topic represents a smart light in your living room...",
      "fullContent": "This topic represents a smart light in your living room. It's currently ON at full brightness (255). The topic follows a typical Home Assistant or MQTT smart home pattern.\n\n```proposal\n{\n  \"topic\": \"home/livingroom/light/set\",\n  \"payload\": \"OFF\",\n  \"qos\": 0,\n  \"description\": \"Turn off the living room light\"\n}\n```",
      "timestamp": "2026-01-30T13:20:16.357Z",
      "proposals": 1,
      "questionProposals": 2
    }
  ],
  "summary": {
    "totalMessages": 2,
    "messagesWithDebugInfo": 1,
    "lastApiCall": "2026-01-30T13:20:15.123Z"
  }
}
```

## Server Console Output

### Example Request Log

```
================================================================================
LLM REQUEST (OpenAI)
================================================================================
Provider: openai
Model: gpt-5-mini
Messages Count: 2

Full Request Body:
{
  model: 'gpt-5-mini',
  messages: [
    {
      role: 'system',
      content: 'You are an expert AI assistant specializing in MQTT (Message Queuing Telemetry Transport) protocol and home/industrial automation systems.\n' +
        '\n' +
        '**Your Core Expertise:**\n' +
        '- MQTT protocol: topics, QoS levels, retained messages, wildcards, last will and testament\n' +
        '- IoT and smart home ecosystems: devices, sensors, actuators, and controllers\n' +
        '- Home automation platforms: Home Assistant, openHAB, Node-RED, MQTT brokers, zigbee2mqtt, tasmota\n' +
        '- Common MQTT topic patterns and naming conventions (e.g., zigbee2mqtt, tasmota, homie)\n' +
        '- Data formats: JSON payloads, binary data, sensor readings, state messages\n' +
        '- Time-series data analysis and pattern recognition\n' +
        '- Troubleshooting connectivity, message delivery, and data quality issues\n' +
        '\n' +
        '**Your Communication Style:**\n' +
        '- Keep your TEXT response CONCISE and practical (2-3 sentences maximum for the explanation)\n' +
        '- Use clear technical language appropriate for users familiar with MQTT\n' +
        '- When analyzing data, identify patterns, anomalies, or potential issues quickly\n' +
        '- Suggest practical next steps or automations when relevant\n' +
        '- Reference common MQTT ecosystems and standards when applicable\n' +
        '- NOTE: Proposals and question suggestions are OUTSIDE the sentence limit - always include them when relevant\n' +
        '...'
    },
    {
      role: 'user',
      content: 'Context:\n' +
        'Topic: home/livingroom/light\n' +
        'Value: {"state":"ON","brightness":255}\n' +
        'Retained: true\n' +
        '\n' +
        'Related Topics (3):\n' +
        '  home/livingroom/thermostat: 21.5\n' +
        '  home/livingroom/motion: false\n' +
        '  home/livingroom/light/set: \n' +
        '\n' +
        'Messages: 42\n' +
        'Subtopics: 3\n' +
        '\n' +
        'User Question: What does this topic do?'
    }
  ],
  max_completion_tokens: 500
}

System Message:
{
  role: 'system',
  content: 'You are an expert AI assistant specializing in MQTT (Message Queuing Telemetry Transport) protocol and home/industrial automation systems.\n' +
    '\n' +
    '**Your Core Expertise:**\n' +
    '- MQTT protocol: topics, QoS levels, retained messages, wildcards, last will and testament\n' +
    '...'
}
================================================================================
```

### Example Response Log

```
================================================================================
LLM RESPONSE (OpenAI)
================================================================================
Duration: 1234 ms

Full Response:
{
  id: 'chatcmpl-AbCdEfGh123456',
  object: 'chat.completion',
  created: 1738247815,
  model: 'gpt-5-mini',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'This topic represents a smart light in your living room. It\'s currently ON at full brightness (255). The topic follows a typical Home Assistant or MQTT smart home pattern.\n' +
          '\n' +
          '```proposal\n' +
          '{\n' +
          '  "topic": "home/livingroom/light/set",\n' +
          '  "payload": "OFF",\n' +
          '  "qos": 0,\n' +
          '  "description": "Turn off the living room light"\n' +
          '}\n' +
          '```\n' +
          '\n' +
          '```question-proposal\n' +
          '{\n' +
          '  "question": "What other devices are in the living room?",\n' +
          '  "category": "analysis"\n' +
          '}\n' +
          '```\n' +
          '\n' +
          '```question-proposal\n' +
          '{\n' +
          '  "question": "How can I dim the light to 50%?",\n' +
          '  "category": "control"\n' +
          '}\n' +
          '```'
      },
      logprobs: null,
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 156,
    completion_tokens: 98,
    total_tokens: 254
  },
  system_fingerprint: 'fp_abc123def456'
}
================================================================================

================================================================================
LLM RPC HANDLER - Returning response
================================================================================
Response length: 456
Has debugInfo: true
================================================================================
```

### Example Error Log

If an error occurs:

```
================================================================================
LLM RPC ERROR
================================================================================
Error message: Invalid API key configuration
Error stack: Error: Invalid API key configuration
    at /home/runner/work/MQTT-Explorer/MQTT-Explorer/dist/src/server.js:642:15
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
Full error: Error: Invalid API key configuration
    at /home/runner/work/MQTT-Explorer/MQTT-Explorer/dist/src/server.js:642:15 {
  status: 401,
  type: 'invalid_request_error',
  code: 'invalid_api_key'
}
================================================================================
```

## Browser Console Output

### Normal Flow

```javascript
LLM Service: Received result from backend: {
  response: "This topic represents a smart light...",
  debugInfo: {
    provider: "openai",
    model: "gpt-5-mini",
    timing: { duration_ms: 1234, timestamp: "2026-01-30T13:20:15.123Z" },
    request: { url: "...", body: {...} },
    response: { id: "chatcmpl-...", usage: {...} }
  }
}
LLM Service: Has response: true
LLM Service: Has debugInfo: true
LLM Service: Assistant message length: 456
LLM Service: Debug info: { provider: "openai", model: "gpt-5-mini", ... }
```

### Error Flow

```javascript
LLM Service: Received result from backend: undefined
LLM Service: Has response: false
LLM Service: Has debugInfo: false
LLM Service: Invalid result from backend: undefined
AI Assistant error: Error: No response from AI assistant
    at LLMService.sendMessage (llmService.ts:440)
Error details: { message: "No response from AI assistant" }
```

## Key Features

### No Truncation

Notice how the system message and all content is shown in full, without any "..." truncation:

- **Before:** Objects were truncated at depth 2, arrays at 10 items
- **After:** Complete objects shown with `depth: null`, full arrays with `maxArrayLength: null`

### Color Coding

In the terminal, the output is color-coded:
- Strings: Green
- Numbers: Yellow
- Booleans: Yellow
- Null/Undefined: Gray
- Object keys: Cyan

### Visual Separators

Clear visual boundaries between sections:
- `===` lines separate major sections
- Consistent formatting makes scanning easier
- Duration and timing info highlighted

### Complete Context

Every debug output includes:
- **What**: The operation being performed
- **When**: Timestamp and duration
- **How**: Complete request parameters
- **Result**: Complete response data
- **Why** (if error): Full error with stack trace

## Usage Tips

1. **Finding Issues**: Look for the last successful log before error
2. **Performance**: Check `duration_ms` for slow requests
3. **Token Usage**: Monitor `usage.total_tokens` to track costs
4. **Content Issues**: Check `fullContent` to see what was actually sent
5. **System Prompt**: Review `systemMessage` to verify LLM instructions

## Production Considerations

While these logs are comprehensive, in production you may want to:

1. **Add log levels**: Use DEBUG level for detailed logs
2. **Reduce verbosity**: Only log errors in production
3. **Sampling**: Log only 1% of requests for monitoring
4. **Remove colors**: Disable ANSI colors for log aggregation tools
5. **PII filtering**: Redact sensitive data from logs

Current implementation is optimized for development and debugging.
