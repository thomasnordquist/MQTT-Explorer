import { Page, Locator } from 'playwright'
import { clickOn } from '.'

/**
 * Selects a topic by clicking on its text (not the expand button)
 * On mobile, this will also switch to the Details tab automatically
 *
 * @param path - Topic path like "mqtt/topic/name" or just "topicname"
 * @param browser - Playwright Page object
 */
export async function selectTopic(path: string, browser: Page) {
  const topics = path.split('/')
  const topicName = topics[topics.length - 1] // Get the last topic in the path

  console.log('selectTopic', topicName, 'from path', path)

  // Find the topic by its data-test-topic attribute
  const topicSelector = `span[data-test-topic='${topicName}']`

  console.log(`Using selector: ${topicSelector}`)

  // Get all matching elements (there may be multiple topics with the same name)
  const allMatches = browser.locator(topicSelector)

  // Count how many matches we have
  const count = await allMatches.count()
  console.log(`Found ${count} elements matching '${topicName}'`)

  // Find the first visible match
  let topicLocator: Locator | null = null
  for (let j = 0; j < count; j += 1) {
    const candidate = allMatches.nth(j)
    try {
      await candidate.waitFor({ state: 'visible', timeout: 3000 })
      topicLocator = candidate
      console.log(`Using match #${j} for '${topicName}'`)
      break
    } catch {
      // This candidate is not visible, try the next one
      continue
    }
  }

  if (!topicLocator) {
    console.error(`Failed to find visible topic "${topicName}"`)
    throw new Error(`Could not find topic "${topicName}"`)
  }

  try {
    console.log(`Selecting topic by clicking text: ${topicName}`)

    // Scroll the element into view to ensure it's clickable
    await topicLocator.scrollIntoViewIfNeeded()
    await new Promise(resolve => setTimeout(resolve, 200))

    // Click on the topic text to select it
    // On mobile, this will also switch to the Details tab
    await clickOn(topicLocator, 1, 0, 'left', false)

    // Give the UI time to process the selection and tab switch
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Successfully selected topic: ${topicName}`)
  } catch (error) {
    console.error(`Failed to select topic "${topicName}"`, error)
    throw new Error(`Could not select topic "${topicName}"`)
  }
}
