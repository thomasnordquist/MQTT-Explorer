import { clickOn } from './'
import { Page } from 'playwright'

export async function expandTopic(path: string, browser: Page) {
  const originalTopics = path.split('/')
  console.log('expandTopic', path)
  let topics = path.split('/')
  while (topics.length > 0 && !(await topicMatches(topics, browser))) {
    topics = topics.slice(0, topics.length - 1)
  }
  if (topics.length === 0) {
    throw Error('could not expand topics, no match found')
  }

  console.log('found topics', topics, originalTopics)

  for (const topic of topics) {
    const match = await browser.locator(topicSelector([topic]))
    await clickOn(match.first())
  }
  // while (topics.length <= originalTopics.length) {
  //   const match = await browser.locator(topicSelector(topics))
  //   console.log('click', match)
  //   await clickOn(match)
  //   topics.push(originalTopics[topics.length])
  // }
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
