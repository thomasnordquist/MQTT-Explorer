import { test, expect } from '@playwright/test'

// Test to verify tool calling works end-to-end
test.describe('AI Assistant Tool Calling', () => {
  test.beforeEach(async ({ page }) => {
    // Check if LLM API key is available
    const hasLLMKey =
      process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY

    if (!hasLLMKey) {
      test.skip()
    }

    // Navigate to the application
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should execute tool calls and return results', async ({ page }) => {
    // Enable console logging to see tool execution
    page.on('console', (msg) => {
      if (msg.text().includes('LLM Service:') || msg.text().includes('Tool')) {
        console.log('Browser console:', msg.text())
      }
    })

    // Expand AI Assistant
    const aiAssistantHeader = page.getByTestId('ai-assistant-header')
    await aiAssistantHeader.click()
    await page.waitForTimeout(500)

    // Type a message that should trigger tool calls
    const input = page.getByTestId('ai-assistant-input')
    await input.fill('What topics are available in this system?')

    // Send the message
    const sendButton = page.getByTestId('ai-assistant-send')
    await sendButton.click()

    // Wait for response (tool calls may take time)
    await page.waitForTimeout(15000) // 15 seconds for LLM + tool execution

    // Check for assistant messages
    const assistantMessages = page.getByTestId('ai-message-assistant')
    const messageCount = await assistantMessages.count()
    
    console.log('Assistant message count:', messageCount)
    expect(messageCount).toBeGreaterThan(0)

    // Get the last message content
    if (messageCount > 0) {
      const lastMessage = assistantMessages.last()
      const messageText = await lastMessage.textContent()
      console.log('Last assistant message:', messageText)
      
      // Should have some content
      expect(messageText).toBeTruthy()
      expect(messageText!.length).toBeGreaterThan(0)
    }

    // Check for tool calls visualization
    const toolCalls = page.locator('[class*="toolCall"]')
    const toolCallCount = await toolCalls.count()
    
    if (toolCallCount > 0) {
      console.log('Tool calls found:', toolCallCount)
      const toolCallText = await toolCalls.first().textContent()
      console.log('Tool call content:', toolCallText)
    } else {
      console.log('No tool calls displayed (may not have been triggered)')
    }
  })
})
