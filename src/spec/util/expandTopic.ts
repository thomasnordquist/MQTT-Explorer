import { clickOn } from './'
import { Page } from 'playwright'

export async function expandTopic(path: string, browser: Page) {
  const topics = path.split('/')
  console.log('expandTopic', path)

  // Build hierarchical selector and expand one level at a time
  for (let i = 0; i < topics.length; i++) {
    // Build a hierarchical selector for the current level
    // e.g., "kitchen" then "kitchen coffee_maker"
    const currentPath = topics.slice(0, i + 1)
    const selectors = currentPath.map(v => `span[data-test-topic='${v}']`)
    const hierarchicalSelector = selectors.join(' ')
    
    console.log(`topic matches`, currentPath, `locator('${hierarchicalSelector}')`)

    const locator = browser.locator(hierarchicalSelector).first()

    // Wait for the topic to be visible with a reasonable timeout
    try {
      await locator.waitFor({ state: 'visible', timeout: 30000 })
      console.log(`found topics`, currentPath, topics)

      // Click to expand this level
      await clickOn(locator)

      // Reduced delay for UI to expand - 200ms is sufficient for most cases
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Failed to find topic path: ${currentPath.join('/')}`, error)
      throw new Error(`Could not find topic "${currentPath.join('/')}" in path "${path}"`)
    }
  }
}
