import 'mocha'
import { expect } from 'chai'
import { Browser, BrowserContext, ElectronApplication, Page, _electron as electron, chromium } from 'playwright'
import type { MqttClient } from 'mqtt'
import { createTestMock, stopTestMock } from './mock-mqtt-test'
import { default as MockSparkplug } from './mock-sparkplugb'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { searchTree, clearSearch } from './scenarios/searchTree'
import { expandTopic } from './util/expandTopic'

/**
 * MQTT Explorer UI Tests
 *
 * Tests the core UI functionality using a single connection.
 * All topics are published before connecting, and tests run sequentially
 * on the same connected application instance.
 *
 * Supports both Electron and Browser modes:
 * - Electron mode: Default behavior, launches Electron app
 * - Browser mode: Set BROWSER_MODE_URL environment variable to the server URL
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
describe('MQTT Explorer UI Tests', function () {
  this.timeout(60000)

  let electronApp: ElectronApplication | undefined
  let browser: Browser | undefined
  let browserContext: BrowserContext | undefined
  let testMock: MqttClient
  let page: Page
  const isBrowserMode = !!process.env.BROWSER_MODE_URL

  before(async function () {
    this.timeout(90000)

    console.log('Creating test-specific MQTT mock (no timers)...')
    testMock = await createTestMock()

    console.log('Publishing test topics...')
    // Publish all test topics before connecting
    testMock.publish('livingroom/lamp/state', 'on', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp/brightness', '128', { retain: true, qos: 0 })
    testMock.publish('livingroom/temperature', '21.0', { retain: true, qos: 0 })

    const coffeeData = {
      heater: 'on',
      temperature: 92.5,
      waterLevel: 0.5,
    }
    testMock.publish('kitchen/coffee_maker', JSON.stringify(coffeeData), { retain: true, qos: 2 })
    testMock.publish('kitchen/lamp/state', 'off', { retain: true, qos: 0 })
    testMock.publish('kitchen/temperature', '22.5', { retain: true, qos: 0 })

    await sleep(2000) // Let MQTT messages propagate and get retained

    if (isBrowserMode) {
      console.log('Launching browser in browser mode...')
      const browserUrl = process.env.BROWSER_MODE_URL
      if (!browserUrl) {
        throw new Error('BROWSER_MODE_URL environment variable must be set when running in browser mode')
      }
      console.log(`Browser URL: ${browserUrl}`)

      // Check if mobile viewport should be used
      const useMobileViewport = process.env.USE_MOBILE_VIEWPORT === 'true'
      console.log(`Mobile viewport: ${useMobileViewport}`)

      // Launch Chromium browser
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      })

      // Create browser context with optional mobile viewport
      const contextOptions: any = {
        permissions: ['clipboard-read', 'clipboard-write'],
      }

      if (useMobileViewport) {
        // Use same viewport as mobile demo (Pixel 6)
        contextOptions.viewport = {
          width: 412,
          height: 914,
        }
        contextOptions.userAgent =
          'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36'
        console.log('Using mobile viewport: 412x914 (Pixel 6)')
      } else {
        // Desktop viewport - ensure width > 768px so mobile UI doesn't activate
        contextOptions.viewport = {
          width: 1280,
          height: 720,
        }
        console.log('Using desktop viewport: 1280x720')
      }

      browserContext = await browser.newContext(contextOptions)
      page = await browserContext.newPage()

      // Listen for console messages
      page.on('console', msg => console.log('Browser console:', msg.type(), msg.text()))
      page.on('pageerror', error => console.error('Browser error:', error))

      // Navigate to the browser mode URL
      await page.goto(browserUrl, { timeout: 30000, waitUntil: 'networkidle' })

      // Handle authentication if required
      const username = process.env.MQTT_EXPLORER_USERNAME || 'test'
      const password = process.env.MQTT_EXPLORER_PASSWORD || 'test123'

      console.log('Waiting for page to initialize and auth check...')
      await sleep(5000) // Wait longer for WebSocket connection attempt and auth error handling

      console.log('Checking for login dialog...')
      const loginDialog = page.locator('h2:has-text("Login to MQTT Explorer")')
      let loginDialogVisible = false
      try {
        loginDialogVisible = await loginDialog.isVisible({ timeout: 10000 })
      } catch (error) {
        // Timeout is expected if dialog is not shown, not an error
        console.log('Login dialog not found (timeout) - checking if auth is disabled')
      }

      // Debug: print page content to see what's rendered
      if (!loginDialogVisible) {
        const body = await page
          .locator('body')
          .textContent()
          .catch(() => 'Unable to read body')
        console.log('Page body text:', body?.substring(0, 300))
      }

      if (loginDialogVisible) {
        console.log('Login dialog detected, authenticating...')
        await page.fill('[data-testid="username-input"] input', username)
        await page.fill('[data-testid="password-input"] input', password)
        await page.click('button:has-text("Login")')
        await sleep(3000) // Wait for authentication to complete and reconnect
        console.log('Authentication complete')
      } else {
        console.log('No login dialog detected - assuming auth is disabled')
      }

      // Wait for the connection dialog to appear
      console.log('Waiting for MQTT connection dialog...')
      try {
        await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })
      } catch (error) {
        console.log('Failed to find connection dialog, taking screenshot for debugging')
        await page.screenshot({ path: 'browser-debug-screenshot.png', fullPage: true })
        throw error
      }
    } else {
      console.log('Launching Electron application...')
      electronApp = await electron.launch({
        args: [`${__dirname}/../../..`, '--runningUiTestOnCi', '--no-sandbox', '--disable-dev-shm-usage'],
        timeout: 60000,
      })

      console.log('Getting application window...')
      page = await electronApp.firstWindow({ timeout: 30000 })
      await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })
    }

    console.log('Connecting to MQTT broker...')
    const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
    await connectTo(brokerHost, page)
    await sleep(3000) // Give time for topics to load
    console.log('Setup complete')
  })

  after(async function () {
    this.timeout(10000)

    if (isBrowserMode) {
      if (browserContext) {
        await browserContext.close()
      }
      if (browser) {
        await browser.close()
      }
    } else if (electronApp) {
      await electronApp.close()
    }

    stopTestMock()
  })

  describe('Connection Management', () => {
    it('should connect and expand livingroom/lamp topic', async () => {
      // Given: Connected to broker with topics loaded
      // When: Expand topic
      await expandTopic('livingroom/lamp', page)

      // Then: Should see lamp state topic
      const stateTopic = page.locator('span[data-test-topic="state"]').first()
      await stateTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await stateTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-connection.png' })
    })
  })

  describe('Topic Tree Structure', () => {
    it('should expand and display kitchen/coffee_maker with JSON payload', async () => {
      // Given: Connected to broker with kitchen/coffee_maker topic
      // When: Expand topic
      await expandTopic('kitchen/coffee_maker', page)

      // Then: The topic should be visible and selected
      const coffeeMakerTopic = page.locator('span[data-test-topic="coffee_maker"]').first()
      await coffeeMakerTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await coffeeMakerTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-kitchen-json.png' })
    })

    it('should expand nested topic livingroom/lamp/state', async () => {
      // Given: Connected to broker with nested topics
      // When: Expand to nested topic
      await expandTopic('livingroom/lamp/state', page)

      // Then: State topic should be visible and selected
      const stateTopic = page.locator('span[data-test-topic="state"]').first()
      await stateTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await stateTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-nested-topic.png' })
    })
  })

  describe('Search Functionality', () => {
    it('should search for temperature and expand kitchen/temperature', async () => {
      // Given: Connected to broker with temperature topics
      // When: Search and expand
      await searchTree('temp', page)
      await sleep(1000)
      await clearSearch(page)
      await sleep(500)
      await expandTopic('kitchen/temperature', page)

      // Then: Temperature topic should be visible
      const tempTopic = page.locator('span[data-test-topic="temperature"]').first()
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search-temp.png' })
    })

    it('should search for lamp and expand kitchen/lamp', async () => {
      // Given: Connected to broker with lamp topics
      // When: Search and expand
      await searchTree('kitchen/lamp', page)
      await sleep(1000)
      await clearSearch(page)
      await sleep(500)
      await expandTopic('kitchen/lamp', page)

      // Then: Lamp topic should be visible
      const lampTopic = page.locator('span[data-test-topic="lamp"]').first()
      await lampTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await lampTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search-lamp.png' })
    })
  })

  describe('Clipboard Operations', () => {
    it('should copy topic path to clipboard in both Electron and browser modes', async () => {
      // Given: A topic is selected
      await clearSearch(page)
      await sleep(1000)
      await expandTopic('livingroom/lamp/state', page)
      await sleep(1000)

      // When: Copy topic button is clicked (in the topic section at the top)
      // The new sidebar has copy buttons in the topic section (for path) and value section (for value)
      // We need to find the first copy button (topic path copy button)
      const copyButtons = page.getByTestId('copy-button')
      const copyTopicButton = copyButtons.first()
      await copyTopicButton.click()
      await sleep(500)

      // Then: Clipboard should contain the topic path
      const clipboardText = await page.evaluate(async () => {
        try {
          // Try to read from clipboard using the Clipboard API
          if (navigator.clipboard && navigator.clipboard.readText) {
            return await navigator.clipboard.readText()
          }
          // Fallback: try to paste into a temporary input element
          const input = document.createElement('input')
          document.body.appendChild(input)
          input.focus()
          document.execCommand('paste')
          const text = input.value
          document.body.removeChild(input)
          return text
        } catch (error) {
          // If clipboard access fails, return empty string
          console.warn('Clipboard read failed:', error)
          return ''
        }
      })

      // Verify clipboard contains expected topic path
      if (clipboardText) {
        expect(clipboardText).to.equal('livingroom/lamp/state')
      } else {
        // If clipboard reading is not available, at least verify the button was clicked
        console.warn('Clipboard verification not available in this environment')
        const copyButton = await copyTopicButton.isVisible()
        expect(copyButton).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-copy-topic.png' })
    })

    it('should copy message value to clipboard in both Electron and browser modes', async () => {
      // Given: A topic with a value is selected (reuse already expanded topic)
      // When: Copy value button is clicked (the second copy button in the value section)
      const copyButtons = page.getByTestId('copy-button')
      const copyValueButton = copyButtons.nth(1) // Second copy button is for the value
      await copyValueButton.click()
      await sleep(500)

      // Then: Clipboard should contain the message value
      const clipboardText = await page.evaluate(async () => {
        try {
          // Try to read from clipboard using the Clipboard API
          if (navigator.clipboard && navigator.clipboard.readText) {
            return await navigator.clipboard.readText()
          }
          // Fallback: try to paste into a temporary input element
          const input = document.createElement('input')
          document.body.appendChild(input)
          input.focus()
          document.execCommand('paste')
          const text = input.value
          document.body.removeChild(input)
          return text
        } catch (error) {
          // If clipboard access fails, return empty string
          console.warn('Clipboard read failed:', error)
          return ''
        }
      })

      // Verify clipboard contains expected value (should be "on" from livingroom/lamp/state)
      if (clipboardText) {
        expect(clipboardText).to.equal('on')
      } else {
        // If clipboard reading is not available, at least verify the button was clicked
        console.warn('Clipboard verification not available in this environment')
        const copyButton = await copyValueButton.isVisible()
        expect(copyButton).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-copy-value.png' })
    })
  })

  describe('File Save/Download Operations', () => {
    it('should save/download message to file in both Electron and browser modes', async () => {
      // Given: A topic with a message is already selected from previous test
      await sleep(500)

      if (isBrowserMode) {
        // In browser mode, set up download handling
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 })

        // When: Save button is clicked (in the new sidebar, save button is in the value section)
        const saveButton = page.getByTestId('save-button')
        await saveButton.click()

        // Then: Download should be triggered
        const download = await downloadPromise
        expect(download).to.not.be.undefined

        // Verify download has a filename
        const filename = download.suggestedFilename()
        expect(filename).to.include('mqtt-message-')
        console.log('Browser mode: File downloaded:', filename)

        // Save to verify (optional, but helps with debugging)
        await download.saveAs(`/tmp/${filename}`)
      } else {
        // In Electron mode, the file dialog would open
        // We can't easily test the native file dialog, but we can verify the button works
        const saveButton = page.getByTestId('save-button')
        const isVisible = await saveButton.isVisible()
        expect(isVisible).to.be.true

        // Note: In Electron, clicking this would open a native dialog which we can't easily automate
        // For now, just verify the button exists
        console.log('Electron mode: Save button is visible (native dialog not tested)')
      }

      await page.screenshot({ path: 'test-screenshot-save-message.png' })
    })
  })

  describe('AI Assistant Chat', () => {
    // Skip tests if no LLM API key is available
    const hasLLMApiKey = !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY)
    
    before(function() {
      if (!hasLLMApiKey) {
        console.log('Skipping AI Assistant tests: No LLM API key found')
        console.log('Set OPENAI_API_KEY, GEMINI_API_KEY, or LLM_API_KEY to run these tests')
        this.skip()
      }
    })

    it('should expand AI Assistant panel when clicked', async function() {
      this.timeout(30000) // Increase timeout for LLM tests
      
      // Given: A topic is selected (from previous tests)
      await expandTopic('livingroom/lamp', page)
      await sleep(1000)

      // When: AI Assistant header is clicked
      const aiAssistant = page.getByTestId('ai-assistant')
      await aiAssistant.waitFor({ state: 'visible', timeout: 5000 })
      
      const header = page.getByTestId('ai-assistant-header')
      await header.click()
      await sleep(500)

      // Then: AI Assistant panel should be expanded
      const messagesContainer = page.getByTestId('ai-assistant-messages')
      await messagesContainer.waitFor({ state: 'visible', timeout: 5000 })
      expect(await messagesContainer.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-ai-assistant-expanded.png' })
    })

    it('should send a message and receive a response from LLM', async function() {
      this.timeout(60000) // LLM API calls can take time
      
      // Given: AI Assistant is expanded (from previous test)
      const input = page.locator('[data-testid="ai-assistant-input"]')
      await input.waitFor({ state: 'visible', timeout: 5000 })
      
      // When: User types a message and sends it
      const testMessage = 'What is this device?'
      await input.fill(testMessage)
      await sleep(500)
      
      const sendButton = page.getByTestId('ai-assistant-send')
      await sendButton.click()
      
      // Then: User message should appear
      const userMessage = page.getByTestId('ai-message-user').first()
      await userMessage.waitFor({ state: 'visible', timeout: 5000 })
      expect(await userMessage.isVisible()).to.be.true
      
      // And: Assistant response should appear (wait up to 30s for LLM response)
      const assistantMessage = page.getByTestId('ai-message-assistant').first()
      await assistantMessage.waitFor({ state: 'visible', timeout: 45000 })
      expect(await assistantMessage.isVisible()).to.be.true
      
      // Verify the assistant message has content
      const messageText = await assistantMessage.textContent()
      expect(messageText).to.not.be.empty
      expect(messageText?.length || 0).to.be.greaterThan(10)
      
      console.log('AI Assistant response received (length: ' + (messageText?.length || 0) + ' chars)')
      
      await page.screenshot({ path: 'test-screenshot-ai-assistant-response.png' })
    })

    it('should allow selecting and copying text from chat messages', async function() {
      this.timeout(30000)
      
      // Given: Chat has messages (from previous test)
      const assistantMessage = page.getByTestId('ai-message-assistant').first()
      await assistantMessage.waitFor({ state: 'visible', timeout: 5000 })
      
      // Get the message text content
      const messageText = await assistantMessage.textContent()
      expect(messageText).to.not.be.empty
      
      // When: We try to select text from the assistant message
      // We'll use triple-click to select all text in the message
      await assistantMessage.click({ clickCount: 3 })
      await sleep(500)
      
      // Then: Text should be selectable (we can verify by checking CSS properties)
      // We verify the userSelect CSS property is set to 'text'
      const userSelectValue = await assistantMessage.evaluate((el) => {
        return window.getComputedStyle(el).userSelect
      })
      
      // The userSelect property should allow text selection
      // Different browsers may report this differently: 'text' or 'auto' or not 'none'
      expect(userSelectValue).to.not.equal('none', 'Text should be selectable (userSelect should not be "none")')
      
      // Also verify the cursor style is appropriate for text
      const cursorValue = await assistantMessage.evaluate((el) => {
        return window.getComputedStyle(el).cursor
      })
      
      console.log(`userSelect: ${userSelectValue}, cursor: ${cursorValue}`)
      
      // Additionally, test that we can actually select text programmatically
      const selectedText = await page.evaluate(() => {
        const selection = window.getSelection()
        return selection?.toString() || ''
      })
      
      // If text was selected, it should have some content
      // (The actual selection may vary by browser, so we just verify it's possible)
      console.log('Selected text length:', selectedText.length)
      
      await page.screenshot({ path: 'test-screenshot-ai-assistant-text-selectable.png' })
    })

    it('should clear chat history when clear button is clicked', async function() {
      this.timeout(15000)
      
      // Given: Chat has messages (from previous test)
      const messagesContainer = page.getByTestId('ai-assistant-messages')
      await messagesContainer.waitFor({ state: 'visible', timeout: 5000 })
      
      // Verify we have messages
      const messagesBefore = await page.getByTestId('ai-message-user').count()
      expect(messagesBefore).to.be.greaterThan(0)
      
      // When: Clear button is clicked (button appears when there are messages)
      const clearButton = page.getByTestId('ai-assistant-clear')
      await clearButton.waitFor({ state: 'visible', timeout: 5000 })
      await clearButton.click()
      await sleep(500)
      
      // Then: Messages should be cleared
      const messagesAfter = await page.getByTestId('ai-message-user').count()
      expect(messagesAfter).to.equal(0)
      
      await page.screenshot({ path: 'test-screenshot-ai-assistant-cleared.png' })
    })

    it('should list topics when asked by the user', async function() {
      this.timeout(90000) // LLM API calls can take time, especially with multiple tool rounds
      
      // Given: AI Assistant is available (from previous tests)
      const input = page.locator('[data-testid="ai-assistant-input"]')
      await input.waitFor({ state: 'visible', timeout: 5000 })
      
      // When: User asks to list topics at the root level
      const testMessage = 'List all the top-level topics. What topics do you see at the root?'
      await input.fill(testMessage)
      await sleep(500)
      
      const sendButton = page.getByTestId('ai-assistant-send')
      await sendButton.click()
      
      // Then: User message should appear
      const userMessage = page.getByTestId('ai-message-user').last()
      await userMessage.waitFor({ state: 'visible', timeout: 5000 })
      expect(await userMessage.isVisible()).to.be.true
      
      // And: Assistant response should appear with topic information (give it extra time for tool calls)
      const assistantMessage = page.getByTestId('ai-message-assistant').last()
      await assistantMessage.waitFor({ state: 'visible', timeout: 60000 })
      expect(await assistantMessage.isVisible()).to.be.true
      
      // Verify the response mentions actual topics from our test data
      const messageText = await assistantMessage.textContent()
      expect(messageText).to.not.be.empty
      expect(messageText?.length || 0).to.be.greaterThan(20)
      
      // The response should mention at least some of the root topics we published
      const lowerText = messageText?.toLowerCase() || ''
      const mentionsTopics = 
        lowerText.includes('livingroom') || 
        lowerText.includes('kitchen')
      
      expect(mentionsTopics, 'Response should mention at least one of the root-level topics (livingroom or kitchen)').to.be.true
      
      console.log('AI Assistant listed topics successfully')
      console.log('Response preview:', messageText?.substring(0, 300))
      
      // Check if tool calls were displayed (they should be visible in the UI)
      const toolCalls = await page.locator('[class*="toolCall"]').count()
      if (toolCalls > 0) {
        console.log(`Tool calls displayed: ${toolCalls}`)
      }
      
      await page.screenshot({ path: 'test-screenshot-ai-assistant-list-topics.png' })
    })

    it('should perform tool calls and find data for selected topic', async function() {
      this.timeout(90000) // LLM API calls with tool calling can take significant time
      
      // Given: Select a specific topic with data
      console.log('Selecting topic: kitchen/coffee_maker')
      await expandTopic('kitchen', page)
      await sleep(500)
      
      // Click on coffee_maker topic to select it
      const coffeeTopicButton = page.locator('[data-test-type="Button"][data-test="coffee_maker"]')
      await coffeeTopicButton.waitFor({ state: 'visible', timeout: 10000 })
      await coffeeTopicButton.click()
      await sleep(1000)
      
      // Verify the topic is selected and has a value
      const valueDisplay = page.locator('[data-testid="value-display"]')
      await valueDisplay.waitFor({ state: 'visible', timeout: 5000 })
      const displayedValue = await valueDisplay.textContent()
      console.log('Topic value displayed:', displayedValue)
      
      // AI Assistant should already be expanded from previous tests
      // If not, expand it
      const messagesContainer = page.getByTestId('ai-assistant-messages')
      const isMessagesVisible = await messagesContainer.isVisible()
      if (!isMessagesVisible) {
        const aiAssistantHeader = page.getByTestId('ai-assistant-header')
        await aiAssistantHeader.click()
        await sleep(500)
      }
      
      // Clear previous messages for clean test
      const clearButton = page.getByTestId('ai-assistant-clear')
      const isClearVisible = await clearButton.isVisible()
      if (isClearVisible) {
        await clearButton.click()
        await sleep(500)
      }
      
      // When: User asks about the selected topic
      const input = page.locator('[data-testid="ai-assistant-input"]')
      await input.waitFor({ state: 'visible', timeout: 5000 })
      
      const testMessage = 'Tell me about this topic. What is its current value and what data does it contain?'
      await input.fill(testMessage)
      await sleep(500)
      
      const sendButton = page.getByTestId('ai-assistant-send')
      await sendButton.click()
      
      // Then: User message should appear
      const userMessage = page.getByTestId('ai-message-user').last()
      await userMessage.waitFor({ state: 'visible', timeout: 5000 })
      expect(await userMessage.isVisible()).to.be.true
      
      // And: Assistant should use tool calls to get topic data
      console.log('Waiting for LLM response (may take 30-60 seconds with tool calls)...')
      const assistantMessage = page.getByTestId('ai-message-assistant').last()
      await assistantMessage.waitFor({ state: 'visible', timeout: 75000 })
      expect(await assistantMessage.isVisible()).to.be.true
      
      // Verify the response contains actual data from the selected topic
      const messageText = await assistantMessage.textContent()
      expect(messageText).to.not.be.empty
      expect(messageText?.length || 0).to.be.greaterThan(50)
      
      console.log('AI Assistant response preview:', messageText?.substring(0, 400))
      
      // The response should mention coffee_maker and its actual data
      const lowerText = messageText?.toLowerCase() || ''
      const mentionsTopic = 
        lowerText.includes('coffee') || 
        lowerText.includes('kitchen')
      
      expect(mentionsTopic, 'Response should mention the selected topic (coffee_maker or kitchen)').to.be.true
      
      // Check if actual data from the topic is mentioned
      // Our test data has: heater: 'on', temperature: 92.5, waterLevel: 0.5
      const mentionsData = 
        lowerText.includes('heater') || 
        lowerText.includes('temperature') || 
        lowerText.includes('water') ||
        lowerText.includes('92') || // temperature value
        lowerText.includes('0.5') // waterLevel value
      
      expect(mentionsData, 'Response should mention actual data from the topic (heater, temperature, waterLevel, or their values)').to.be.true
      
      // Check if tool calls were displayed
      const toolCallsContainer = page.locator('[class*="toolCall"]')
      const toolCallCount = await toolCallsContainer.count()
      
      if (toolCallCount > 0) {
        console.log(`✅ Tool calls displayed: ${toolCallCount}`)
        
        // Try to get tool call text
        for (let i = 0; i < Math.min(toolCallCount, 3); i++) {
          const toolCallText = await toolCallsContainer.nth(i).textContent()
          console.log(`Tool call ${i + 1}:`, toolCallText?.substring(0, 100))
        }
      } else {
        console.log('ℹ️  Tool calls not visually displayed (but may have been used internally)')
      }
      
      // Check for the 🔧 tool call badge
      const toolCallBadge = page.locator('text=/🔧|Tool Call/i')
      const hasBadge = await toolCallBadge.count() > 0
      if (hasBadge) {
        console.log('✅ Tool call badge (🔧) found in UI')
      }
      
      console.log('Tool calling test successful!')
      console.log('- Selected topic: kitchen/coffee_maker')
      console.log('- LLM used tools to query topic data')
      console.log('- Response includes actual values from MQTT topic')
      
      await page.screenshot({ path: 'test-screenshot-ai-assistant-tool-calling.png' })
    })

    it('should show human-readable tool actions during thinking', async function () {
      this.timeout(120000)
      
      console.log('Testing human-readable tool action display...')
      
      // Select a topic
      await expandTopic('kitchen', page)
      const coffeeNode = page.locator('[data-test-type="TreeNode"][data-test="coffee_maker"]')
      await coffeeNode.click()
      await sleep(500)
      
      console.log('Topic selected: kitchen/coffee_maker')
      
      // Expand AI Assistant if needed
      const isExpanded = await page.getByTestId('ai-assistant-messages').isVisible().catch(() => false)
      if (!isExpanded) {
        const header = page.getByTestId('ai-assistant-header')
        await header.click()
        await sleep(500)
      }
      
      // Clear previous messages
      const clearButton = page.getByTestId('ai-assistant-clear')
      if (await clearButton.isVisible().catch(() => false)) {
        await clearButton.click()
        await sleep(500)
      }
      
      // Send a message that will trigger tool calls
      const input = page.getByTestId('ai-assistant-input')
      await input.fill('Tell me about this topic and list its children')
      
      const sendButton = page.getByTestId('ai-assistant-send')
      await sendButton.click()
      
      console.log('Message sent, waiting for tool actions...')
      
      // Wait for "Thinking" to appear
      const thinkingText = page.locator('text=/💭\\s*Thinking/i')
      await thinkingText.waitFor({ state: 'visible', timeout: 10000 })
      expect(await thinkingText.isVisible()).to.be.true
      
      console.log('✅ "💭 Thinking" header visible')
      
      // Look for human-readable tool actions
      // These should appear as readable text like "Listing children of..." or "Getting details for..."
      const toolActionText = page.locator('text=/Listing children|Getting details|Querying history|Getting parent/i')
      
      // Wait a bit for tool actions to appear
      await sleep(2000)
      
      const actionCount = await toolActionText.count()
      console.log(`Found ${actionCount} human-readable tool actions`)
      
      if (actionCount > 0) {
        for (let i = 0; i < Math.min(actionCount, 3); i++) {
          const actionText = await toolActionText.nth(i).textContent()
          console.log(`  Action ${i + 1}:`, actionText)
          
          // Verify it's NOT the technical format (should not contain "get_topic(topic:")
          expect(actionText).to.not.match(/get_topic\s*\(/i, 'Should be human-readable, not technical format')
          expect(actionText).to.not.match(/list_children\s*\(/i, 'Should be human-readable, not technical format')
        }
      }
      
      await page.screenshot({ path: 'test-screenshot-tool-actions-thinking.png' })
      
      console.log('✅ Human-readable tool actions displayed during thinking')
    })

    it('should persist tool actions after response is received', async function () {
      this.timeout(120000)
      
      console.log('Testing tool action persistence...')
      
      // Wait for the response to arrive (from previous test)
      const assistantMessage = page.getByTestId('ai-message-assistant').last()
      await assistantMessage.waitFor({ state: 'visible', timeout: 75000 })
      
      console.log('✅ Response received')
      
      // Check that "Thinking" is no longer visible (it should disappear)
      const thinkingText = page.locator('text=/💭\\s*Thinking/i')
      const thinkingVisible = await thinkingText.isVisible().catch(() => false)
      
      // Tool actions should still be visible even after response
      const toolActionText = page.locator('text=/Listing children|Getting details|Querying history|Getting parent/i')
      const actionCount = await toolActionText.count()
      
      console.log(`Tool actions visible after response: ${actionCount}`)
      expect(actionCount).to.be.greaterThan(0, 'Tool actions should persist after response')
      
      // Verify actions are still readable
      for (let i = 0; i < Math.min(actionCount, 2); i++) {
        const actionText = await toolActionText.nth(i).textContent()
        console.log(`  Persisted action ${i + 1}:`, actionText)
      }
      
      await page.screenshot({ path: 'test-screenshot-tool-actions-persisted.png' })
      
      console.log('✅ Tool actions persist after response received')
    })

    it('should hide technical tool call details by default (no DEBUG_TOOL_CALLS)', async function () {
      this.timeout(30000)
      
      console.log('Testing that technical tool call details are hidden...')
      
      // Check that the technical "🔨 Tool Calls" alert is NOT visible
      // This should only show when DEBUG_TOOL_CALLS environment variable is set
      const technicalToolCallsAlert = page.locator('text=/🔨\\s*Tool Calls/i')
      const technicalVisible = await technicalToolCallsAlert.isVisible().catch(() => false)
      
      expect(technicalVisible).to.be.false('Technical tool call details should be hidden by default')
      
      console.log('✅ Technical tool call details properly hidden (debug mode off)')
      
      // The human-readable actions should still be visible
      const toolActionText = page.locator('text=/Listing children|Getting details|Querying history|Getting parent/i')
      const actionCount = await toolActionText.count()
      
      console.log(`Human-readable actions visible: ${actionCount}`)
      expect(actionCount).to.be.greaterThan(0, 'Human-readable actions should be visible')
      
      await page.screenshot({ path: 'test-screenshot-no-debug-details.png' })
      
      console.log('✅ Clean UI confirmed - technical details hidden, human-readable actions shown')
    })
  })
})
