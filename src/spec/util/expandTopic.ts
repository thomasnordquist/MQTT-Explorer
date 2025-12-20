import { clickOn } from './'
import { Page } from 'playwright'

export async function expandTopic(path: string, browser: Page) {
  const topics = path.split('/')
  console.log('expandTopic', path, topics)

  // Navigate through the topic hierarchy one level at a time
  for (const topic of topics) {
    const selector = `span[data-test-topic='${topic}']`

    console.log(`Looking for topic: ${topic}, selector: ${selector}`)

    const locator = browser.locator(selector).first()

    // Wait for the topic to be visible with a reasonable timeout
    try {
      await locator.waitFor({ state: 'visible', timeout: 30000 })
      console.log(`Found topic: ${topic}`)

      // Click to expand (if not the last topic)
      await clickOn(locator)

      // Reduced delay for UI to expand - 200ms is sufficient for most cases
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Failed to find topic: ${topic}`, error)
      throw new Error(`Could not find topic "${topic}" in path "${path}"`)
    }
  }
}
