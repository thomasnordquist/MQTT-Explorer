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
  // Strategy: Click on the expand button (▶/▼) for each topic level
  // This is different from clicking the topic text which selects it and switches to Details tab
  for (let i = 0; i < topics.length; i += 1) {
    const topicName = topics[i]
    const currentPath = topics.slice(0, i + 1)
    const nextTopicName = i < topics.length - 1 ? topics[i + 1] : null

    console.log(`Expanding level ${i + 1}/${topics.length}: ${topicName}`)

    // Find the topic by its data-test-topic attribute
    // After expanding previous levels, the current level should be visible
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
        // Increased timeout to 3000ms to handle slower UI after many test runs
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
      console.error(`Failed to find visible topic "${topicName}" in path "${currentPath.join('/')}"`)
      throw new Error(`Could not find topic "${topicName}" in path "${currentPath.join('/')}"`)
    }

    try {
      // Find the expand button (▶/▼) for this topic
      // The expand button is a sibling of the topic text within the same TreeNodeTitle
      // Navigate to the parent span (TreeNodeTitle container) and find the expander
      const parentSpan = topicLocator.locator('..')
      const expandButton = parentSpan.locator('span.expander, span[class*="expander"]')
      
      const expandButtonCount = await expandButton.count()
      
      // Only click expand button if it exists (topics with children)
      // Topics without children don't have an expand button
      if (expandButtonCount > 0) {
        console.log(`Found expand button for topic: ${topicName}`)

        // Scroll the expand button into view to ensure it's clickable
        await expandButton.scrollIntoViewIfNeeded()
        await new Promise(resolve => setTimeout(resolve, 200))

        // Check if already expanded (▼ means expanded, ▶ means collapsed)
        const buttonText = await expandButton.textContent()
        const isCollapsed = buttonText?.includes('▶')
        
        if (isCollapsed) {
          console.log(`Expanding topic: ${topicName}`)
          // Click the expand button to expand this level
          // Use force:true to bypass any overlays (e.g., accordions) that might intercept
          await clickOn(expandButton, 1, 0, 'left', true)

          // Give the UI time to expand and render child topics
          // This is important for MQTT async operations and tree rendering
          await new Promise(resolve => setTimeout(resolve, TREE_EXPANSION_DELAY_MS))
        } else {
          console.log(`Topic ${topicName} is already expanded`)
        }
      } else {
        console.log(`Topic ${topicName} has no expand button (leaf topic or empty)`)
      }

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
          console.log('No children found yet, waiting additional time...')
          await new Promise(resolve => setTimeout(resolve, TREE_EXPANSION_DELAY_MS))
        }
      }
    } catch (error) {
      console.error(`Failed to expand topic "${topicName}" in path "${currentPath.join('/')}"`, error)
      throw new Error(`Could not expand topic "${topicName}" in path "${currentPath.join('/')}"`)
    }
  }
}
