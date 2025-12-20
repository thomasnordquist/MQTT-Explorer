import { clickOn } from './'
import { Page, Locator } from 'playwright'

// Time to wait after clicking a topic for the tree to expand and render children
// Increased to 1000ms to handle sequential test execution where UI might be slower
const TREE_EXPANSION_DELAY_MS = 1000

// Additional wait time to ensure child topics are rendered after expansion
const CHILD_RENDER_DELAY_MS = 500

export async function expandTopic(path: string, browser: Page) {
  const topics = path.split('/')
  console.log('expandTopic', path)

  // Expand each level of the topic tree one at a time
  // Strategy: Click on each topic level individually, relying on the fact that
  // after clicking a parent, its children become visible and we can find the next level
  for (let i = 0; i < topics.length; i += 1) {
    const topicName = topics[i]
    const currentPath = topics.slice(0, i + 1)
    const nextTopicName = i < topics.length - 1 ? topics[i + 1] : null

    console.log(`Expanding level ${i + 1}/${topics.length}: ${topicName}`)

    // Find the topic by its data-test-topic attribute
    // After expanding previous levels, the current level should be visible
    const selector = `span[data-test-topic='${topicName}']`

    console.log(`Using selector: ${selector}`)

    // Get all matching elements (there may be multiple topics with the same name)
    const allMatches = browser.locator(selector)

    // Count how many matches we have
    const count = await allMatches.count()
    console.log(`Found ${count} elements matching '${topicName}'`)

    // Find the first visible match
    let locator: Locator | null = null
    for (let j = 0; j < count; j += 1) {
      const candidate = allMatches.nth(j)
      try {
        // Increased timeout to 3000ms to handle slower UI after many test runs
        await candidate.waitFor({ state: 'visible', timeout: 3000 })
        locator = candidate
        console.log(`Using match #${j} for '${topicName}'`)
        break
      } catch {
        // This candidate is not visible, try the next one
        continue
      }
    }

    if (!locator) {
      console.error(`Failed to find visible topic "${topicName}" in path "${currentPath.join('/')}"`)
      throw new Error(`Could not find topic "${topicName}" in path "${currentPath.join('/')}"`)
    }

    try {
      console.log(`Found and clicking topic: ${topicName}`)

      // Scroll the element into view to ensure it's clickable
      await locator.scrollIntoViewIfNeeded()
      await new Promise(resolve => setTimeout(resolve, 200))

      // Click to expand/select this level
      await clickOn(locator)

      // Give the UI time to expand and render child topics
      // This is important for MQTT async operations and tree rendering
      await new Promise(resolve => setTimeout(resolve, TREE_EXPANSION_DELAY_MS))

      // If this is not the last topic in the path, verify that children rendered
      if (nextTopicName) {
        console.log(`Waiting for children of '${topicName}' to render...`)
        await new Promise(resolve => setTimeout(resolve, CHILD_RENDER_DELAY_MS))
        
        // Check if the next topic is now visible
        const nextSelector = `span[data-test-topic='${nextTopicName}']`
        const nextMatches = browser.locator(nextSelector)
        const nextCount = await nextMatches.count()
        console.log(`After expanding '${topicName}', found ${nextCount} elements for next topic '${nextTopicName}'`)
        
        // If we don't find the next topic, wait a bit longer
        if (nextCount === 0) {
          console.log(`No children found yet, waiting additional time...`)
          await new Promise(resolve => setTimeout(resolve, TREE_EXPANSION_DELAY_MS))
        }
      }
    } catch (error) {
      console.error(`Failed to click topic "${topicName}" in path "${currentPath.join('/')}"`, error)
      throw new Error(`Could not click topic "${topicName}" in path "${currentPath.join('/')}"`)
    }
  }
}
