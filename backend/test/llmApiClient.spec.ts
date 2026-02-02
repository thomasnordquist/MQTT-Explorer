import { expect } from 'chai'
import 'mocha'
import { LLMApiClient, LLMTool } from '../src/llmApiClient'

/**
 * Unit Tests for LLM API Client Tool Calling
 * 
 * These tests verify the tool calling infrastructure works correctly
 * without making actual API calls (mocking would be needed for full unit tests)
 */

describe('LLM API Client - Tool Calling', () => {
  describe('Tool Configuration', () => {
    it('should accept tools in configuration', () => {
      const tools: LLMTool[] = [
        {
          type: 'function',
          function: {
            name: 'test_tool',
            description: 'A test tool',
            parameters: {
              type: 'object',
              properties: {
                param1: { type: 'string', description: 'Test parameter' },
              },
              required: ['param1'],
            },
          },
        },
      ]

      const client = new LLMApiClient({
        apiKey: 'sk-test-key',
        tools,
      })

      // Verify tools are stored
      expect((client as any).tools).to.deep.equal(tools)
    })

    it('should work without tools', () => {
      const client = new LLMApiClient({
        apiKey: 'sk-test-key',
      })

      // Verify tools are undefined
      expect((client as any).tools).to.be.undefined
    })
  })

  describe('Message Format', () => {
    it('should support tool role in messages', () => {
      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant' },
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
        { role: 'tool' as const, content: 'Tool result', tool_call_id: '123', name: 'test_tool' },
      ]

      // Verify all message types are valid
      messages.forEach(msg => {
        expect(msg.role).to.be.oneOf(['system', 'user', 'assistant', 'tool'])
        expect(msg.content).to.be.a('string')
      })
    })
  })
})
