import { expect } from 'chai'
import 'mocha'
import { LLMService, MessageProposal, QuestionProposal, ParsedResponse } from '../llmService'

describe('LLMService', () => {
  describe('parseResponse', () => {
    let service: LLMService

    beforeEach(() => {
      service = new LLMService()
    })

    it('should extract single proposal from response', () => {
      const response = `This is a smart light. You can control it by publishing to the set topic.

\`\`\`proposal
{
  "topic": "zigbee2mqtt/living_room_light/set",
  "payload": "{\\"state\\": \\"ON\\"}",
  "qos": 0,
  "description": "Turn on the living room light"
}
\`\`\`

This will turn on your light.`

      const parsed = service.parseResponse(response)

      expect(parsed.proposals).to.have.lengthOf(1)
      expect(parsed.proposals[0].topic).to.equal('zigbee2mqtt/living_room_light/set')
      expect(parsed.proposals[0].payload).to.equal('{"state": "ON"}')
      expect(parsed.proposals[0].qos).to.equal(0)
      expect(parsed.proposals[0].description).to.equal('Turn on the living room light')
      expect(parsed.text).to.not.include('```proposal')
    })

    it('should extract multiple proposals from response', () => {
      const response = `Here are some actions you can take:

\`\`\`proposal
{
  "topic": "home/light/set",
  "payload": "ON",
  "qos": 0,
  "description": "Turn on the light"
}
\`\`\`

\`\`\`proposal
{
  "topic": "home/light/set",
  "payload": "OFF",
  "qos": 0,
  "description": "Turn off the light"
}
\`\`\`

Choose one of these actions.`

      const parsed = service.parseResponse(response)

      expect(parsed.proposals).to.have.lengthOf(2)
      expect(parsed.proposals[0].description).to.equal('Turn on the light')
      expect(parsed.proposals[1].description).to.equal('Turn off the light')
    })

    it('should handle response with no proposals', () => {
      const response = 'This is just a regular response with no proposals.'

      const parsed = service.parseResponse(response)

      expect(parsed.proposals).to.have.lengthOf(0)
      expect(parsed.text).to.equal(response)
    })

    it('should handle malformed proposal JSON gracefully', () => {
      const response = `Bad proposal:

\`\`\`proposal
{
  "topic": "home/light/set"
  "payload": "ON" // missing comma
}
\`\`\`

This should be ignored.`

      const parsed = service.parseResponse(response)

      expect(parsed.proposals).to.have.lengthOf(0)
      expect(parsed.text).to.not.include('```proposal')
    })

    it('should require topic, payload, and description in proposal', () => {
      const response = `\`\`\`proposal
{
  "topic": "home/light/set"
}
\`\`\`

Missing payload and description.`

      const parsed = service.parseResponse(response)

      expect(parsed.proposals).to.have.lengthOf(0)
    })

    it('should default QoS to 0 if not specified', () => {
      const response = `\`\`\`proposal
{
  "topic": "home/light/set",
  "payload": "ON",
  "description": "Turn on"
}
\`\`\``

      const parsed = service.parseResponse(response)

      expect(parsed.proposals).to.have.lengthOf(1)
      expect(parsed.proposals[0].qos).to.equal(0)
    })

    it('should remove all proposal blocks from display text', () => {
      const response = `Before

\`\`\`proposal
{"topic": "a", "payload": "b", "description": "c"}
\`\`\`

Middle

\`\`\`proposal
{"topic": "d", "payload": "e", "description": "f"}
\`\`\`

After`

      const parsed = service.parseResponse(response)

      // Should remove proposal blocks but preserve structure
      expect(parsed.text).to.not.include('```proposal')
      expect(parsed.text).to.include('Before')
      expect(parsed.text).to.include('Middle')
      expect(parsed.text).to.include('After')
    })

    it('should extract question proposals from response', () => {
      const response = `This is a smart light.

\`\`\`question-proposal
{
  "question": "Can I set the brightness level?",
  "category": "control"
}
\`\`\`

\`\`\`question-proposal
{
  "question": "What other states does this support?",
  "category": "analysis"
}
\`\`\`

These are helpful follow-up questions.`

      const parsed = service.parseResponse(response)

      expect(parsed.questions).to.have.lengthOf(2)
      expect(parsed.questions[0].question).to.equal('Can I set the brightness level?')
      expect(parsed.questions[0].category).to.equal('control')
      expect(parsed.questions[1].question).to.equal('What other states does this support?')
      expect(parsed.questions[1].category).to.equal('analysis')
      expect(parsed.text).to.not.include('```question-proposal')
    })

    it('should handle response with both proposals and questions', () => {
      const response = `Here's what you can do:

\`\`\`proposal
{
  "topic": "home/light/set",
  "payload": "ON",
  "qos": 0,
  "description": "Turn on the light"
}
\`\`\`

\`\`\`question-proposal
{
  "question": "Can I dim the light?",
  "category": "control"
}
\`\`\`

Both actions and questions provided.`

      const parsed = service.parseResponse(response)

      expect(parsed.proposals).to.have.lengthOf(1)
      expect(parsed.questions).to.have.lengthOf(1)
      expect(parsed.text).to.not.include('```proposal')
      expect(parsed.text).to.not.include('```question-proposal')
    })

    it('should handle question without category', () => {
      const response = `\`\`\`question-proposal
{
  "question": "What is the message frequency?"
}
\`\`\``

      const parsed = service.parseResponse(response)

      expect(parsed.questions).to.have.lengthOf(1)
      expect(parsed.questions[0].question).to.equal('What is the message frequency?')
      expect(parsed.questions[0].category).to.be.undefined
    })
  })

  describe('getQuickSuggestions', () => {
    let service: LLMService

    beforeEach(() => {
      service = new LLMService()
    })

    it('should suggest data structure questions for topics with payload', () => {
      const topic = {
        message: { payload: { value: 123 } },
        childTopicCount: () => 0,
        messages: 1,
      }

      const suggestions = service.getQuickSuggestions(topic)

      expect(suggestions).to.include('Explain this data structure')
      expect(suggestions).to.include('What does this value mean?')
    })

    it('should suggest subtopic summary for parent topics', () => {
      const topic = {
        childTopicCount: () => 5,
        messages: 1,
      }

      const suggestions = service.getQuickSuggestions(topic)

      expect(suggestions).to.include('Summarize all subtopics')
    })

    it('should suggest pattern analysis for topics with multiple messages', () => {
      const topic = {
        messages: 10,
        childTopicCount: () => 0,
      }

      const suggestions = service.getQuickSuggestions(topic)

      expect(suggestions).to.include('Analyze message patterns')
    })

    it('should always include generic suggestion', () => {
      const topic = {
        messages: 1,
        childTopicCount: () => 0,
      }

      const suggestions = service.getQuickSuggestions(topic)

      expect(suggestions).to.include('What can I do with this topic?')
    })
  })

  describe('hasApiKey', () => {
    let service: LLMService

    beforeEach(() => {
      service = new LLMService()
    })

    it('should return false when no API key is available', () => {
      // Clear any window-level config
      if (typeof window !== 'undefined') {
        delete (window as any).__llmAvailable
      }

      const hasKey = service.hasApiKey()

      expect(hasKey).to.be.false
    })

    it('should return true when backend indicates availability', () => {
      if (typeof window !== 'undefined') {
        ;(window as any).__llmAvailable = true
      }

      const hasKey = service.hasApiKey()

      expect(hasKey).to.be.true
    })
  })
})
