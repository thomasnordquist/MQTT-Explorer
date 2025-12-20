import { clickOn } from './'
import { Page } from 'playwright'

export async function expandTopic(path: string, browser: Page) {
  const topics = path.split('/')
  console.log('expandTopic', path, topics)

  // Navigate through the topic hierarchy one level at a time
  let topicIndex = 0
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

      // Give time for UI to expand and show children
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Failed to find topic: ${topic}`, error)
      throw new Error(`Could not find topic "${topic}" in path "${path}"`)
    }
    topicIndex += 1
  }
}

async function topicMatches(topics: Array<string>, browser: Page) {
  const result = await browser.locator(topicSelector(topics))
  console.log('topic matches', topics, result)
  return true
}

function topicSelector(topics: Array<string>) {
  const selectors = topics.map(v => `span[data-test-topic='${v}']`)
  return selectors.join(' ')
}
