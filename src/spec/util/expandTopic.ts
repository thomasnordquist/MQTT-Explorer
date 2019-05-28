import { Browser } from 'webdriverio'
import { clickOn } from './'

export async function expandTopic(path: string, browser: Browser) {
  const originalTopics = path.split('/')
  let topics = path.split('/')
  while (topics.length > 0 && !await topicMatches(topics, browser)) {
    topics = topics.slice(0, topics.length - 1)
  }
  if (topics.length === 0) {
    throw Error('could not expand topics, no match found')
  }

  while (topics.length <= originalTopics.length) {
    const match = await browser.$(topicSelector(topics))
    await clickOn(match, browser)
    topics.push(originalTopics[topics.length])
  }
}

async function topicMatches(topics: string[], browser: Browser) {
  const result = await browser.$(topicSelector(topics))
  return result.isExisting()
}

function topicSelector(topics: string[]) {
  const suffix = topics.map(topic => `*[contains(text(), "${topic}")]`).join('/../..//')
  return `//${suffix}`
}
