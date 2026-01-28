import { expect } from 'chai'
import 'mocha'
import { LLMService, MessageProposal, QuestionProposal, ParsedResponse } from '../llmService'

describe('LLMService', () => {
  describe('buildTopicContext', () => {
    let service: LLMService

    beforeEach(() => {
      service = new LLMService()
    })

    it('should build context with parent, siblings, children, and grandchildren topics', () => {
      // Create a mock topic tree structure:
      // home
      //   ├── livingroom
      //   │   ├── light
      //   │   │   ├── set
      //   │   │   ├── brightness
      //   │   │   │   └── set
      //   │   │   └── availability
      //   │   ├── thermostat
      //   │   └── motion
      //   └── kitchen
      //       └── sensor

      const mockGrandchildSet: any = {
        path: () => 'home/livingroom/light/brightness/set',
        message: {
          payload: {
            format: () => ['50'],
          },
        },
      }

      const mockGrandchildBrightness: any = {
        path: () => 'home/livingroom/light/brightness',
        message: {
          payload: {
            format: () => ['75'],
          },
        },
        edgeCollection: {
          edges: [{ name: 'set', node: mockGrandchildSet }],
        },
      }

      const mockChildSet: any = {
        path: () => 'home/livingroom/light/set',
        message: {
          payload: {
            format: () => ['{"state": "ON"}'],
          },
        },
      }

      const mockChildBrightness: any = {
        path: () => 'home/livingroom/light/brightness',
        message: {
          payload: {
            format: () => ['100'],
          },
        },
        edgeCollection: {
          edges: [{ name: 'set', node: mockGrandchildSet }],
        },
      }

      const mockChildAvailability: any = {
        path: () => 'home/livingroom/light/availability',
        message: {
          payload: {
            format: () => ['online'],
          },
        },
      }

      const mockSiblingThermostat: any = {
        path: () => 'home/livingroom/thermostat',
        message: {
          payload: {
            format: () => ['21.5'],
          },
        },
      }

      const mockSiblingMotion: any = {
        path: () => 'home/livingroom/motion',
        message: {
          payload: {
            format: () => ['false'],
          },
        },
      }

      const mockCousinSensor: any = {
        path: () => 'home/kitchen/sensor',
        message: {
          payload: {
            format: () => ['{"temperature": 22}'],
          },
        },
      }

      const mockCousinParent: any = {
        path: () => 'home/kitchen',
        message: {
          payload: {
            format: () => ['kitchen_scene'],
          },
        },
        edgeCollection: {
          edges: [{ name: 'sensor', node: mockCousinSensor }],
        },
      }

      const mockParent: any = {
        path: () => 'home/livingroom',
        message: {
          payload: {
            format: () => ['evening_scene'],
          },
        },
        edgeCollection: {
          edges: [
            { name: 'light', node: null }, // Current topic (will be set below)
            { name: 'thermostat', node: mockSiblingThermostat },
            { name: 'motion', node: mockSiblingMotion },
          ],
        },
      }

      const mockGrandparent: any = {
        path: () => 'home',
        message: {
          payload: {
            format: () => ['home_automation'],
          },
        },
        edgeCollection: {
          edges: [
            { name: 'livingroom', node: mockParent },
            { name: 'kitchen', node: mockCousinParent },
          ],
        },
      }

      mockParent.parent = mockGrandparent

      const mockCurrentTopic: any = {
        path: () => 'home/livingroom/light',
        type: 'json',
        message: {
          payload: {
            format: () => ['{"state": "ON", "brightness": 100}'],
          },
          retain: true,
        },
        parent: mockParent,
        edgeCollection: {
          edges: [
            { name: 'set', node: mockChildSet },
            { name: 'brightness', node: mockChildBrightness },
            { name: 'availability', node: mockChildAvailability },
          ],
        },
      }

      const context = service.generateTopicContext(mockCurrentTopic)

      // Verify context structure
      expect(context).to.be.a('string')
      expect(context.length).to.be.greaterThan(0)

      // Should include the main topic path
      expect(context).to.include('Topic: home/livingroom/light')

      // Should include the current value (escaped as single line)
      expect(context).to.include('Value:')
      expect(context).to.match(/Value:.*state.*ON/)
      expect(context).to.match(/Value:.*brightness.*100/)

      // Should include retained status
      expect(context).to.include('Retained: true')

      // Should include related topics section
      expect(context).to.include('Related Topics')

      // Priority 1: Should include parent value (for hierarchical context)
      expect(context).to.include('home/livingroom:')
      expect(context).to.include('evening_scene')

      // Priority 2: Should include siblings
      expect(context).to.include('home/livingroom/thermostat:')
      expect(context).to.include('21.5')
      expect(context).to.include('home/livingroom/motion:')
      expect(context).to.include('false')

      // Priority 3: Should include children
      expect(context).to.include('home/livingroom/light/set:')
      expect(context).to.include('home/livingroom/light/brightness:')
      expect(context).to.include('home/livingroom/light/availability:')
      expect(context).to.include('online')

      // Priority 4: Should include grandchildren (2 levels deep)
      expect(context).to.include('home/livingroom/light/brightness/set:')
      expect(context).to.include('50')

      // Verify all values are escaped to single-line format (no raw newlines)
      const lines = context.split('\n')
      for (const line of lines) {
        if (line.includes('Value:') || line.includes(':')) {
          // Values should be escaped, not contain actual newlines
          expect(line).to.not.match(/[^\\]\n/)
        }
      }
    })

    it('should build LLM query structure with system prompt and context', () => {
      // Create a simple mock topic
      const mockParent: any = {
        path: () => 'zigbee2mqtt',
        message: {
          payload: {
            format: () => ['coordinator'],
          },
        },
        edgeCollection: {
          edges: [
            {
              name: 'bedroom_light',
              node: {
                path: () => 'zigbee2mqtt/bedroom_light',
                message: {
                  payload: {
                    format: () => ['{"state": "OFF"}'],
                  },
                },
              },
            },
          ],
        },
      }

      const mockTopic: any = {
        path: () => 'zigbee2mqtt/living_room_light',
        type: 'json',
        message: {
          payload: {
            format: () => ['{"state": "ON", "brightness": 255}'],
          },
        },
        parent: mockParent,
        edgeCollection: {
          edges: [
            {
              name: 'set',
              node: {
                path: () => 'zigbee2mqtt/living_room_light/set',
                message: {
                  payload: {
                    format: () => ['{}'],
                  },
                },
              },
            },
            {
              name: 'availability',
              node: {
                path: () => 'zigbee2mqtt/living_room_light/availability',
                message: {
                  payload: {
                    format: () => ['online'],
                  },
                },
              },
            },
          ],
        },
      }

      // Build context
      const context = service.generateTopicContext(mockTopic)

      // Verify the query would contain:
      // 1. Topic path
      expect(context).to.include('Topic: zigbee2mqtt/living_room_light')

      // 2. Current value (escaped as single line)
      expect(context).to.include('Value:')
      expect(context).to.match(/Value:.*state.*ON/)
      expect(context).to.match(/Value:.*brightness.*255/)

      // 3. Parent topic (hierarchy context)
      expect(context).to.include('Related Topics')
      expect(context).to.include('zigbee2mqtt:')
      expect(context).to.include('coordinator')

      // 4. Sibling topics
      expect(context).to.include('zigbee2mqtt/bedroom_light:')
      expect(context).to.match(/bedroom_light:.*state.*OFF/)

      // 5. Child topics
      expect(context).to.include('zigbee2mqtt/living_room_light/set:')
      expect(context).to.include('zigbee2mqtt/living_room_light/availability:')
      expect(context).to.include('online')

      // Verify structure allows LLM to:
      // - Understand this is a zigbee2mqtt device
      // - See it's currently ON with full brightness
      // - Know there's a /set topic for control
      // - Know there's an availability topic showing online status
      // - See sibling device (bedroom_light) is OFF
    })

    it('should respect token limit for neighboring topics', () => {
      // Create a topic with many neighbors
      const siblings: any[] = []
      for (let i = 0; i < 100; i++) {
        siblings.push({
          name: `device_${i}`,
          node: {
            path: () => `home/devices/device_${i}`,
            message: {
              payload: {
                format: () => [`{"status": "active", "value": ${i}}`],
              },
            },
          },
        })
      }

      const mockParent: any = {
        path: () => 'home/devices',
        message: {
          payload: {
            format: () => ['devices_group'],
          },
        },
        edgeCollection: {
          edges: siblings,
        },
      }

      const mockTopic: any = {
        path: () => 'home/devices/device_0',
        message: {
          payload: {
            format: () => ['{"status": "active"}'],
          },
        },
        parent: mockParent,
      }

      const context = service.generateTopicContext(mockTopic)

      // Should include some neighbors but not all 100
      expect(context).to.include('Related Topics')
      expect(context).to.include('home/devices/device_')

      // Verify context is within reasonable size (not unlimited)
      // With 500 token limit and ~30 tokens per neighbor, expect ~15-20 neighbors max
      const neighborCount = (context.match(/home\/devices\/device_\d+:/g) || []).length
      expect(neighborCount).to.be.lessThan(30) // Should be limited, not all 100
      expect(neighborCount).to.be.greaterThan(5) // Should include several neighbors
    })

    it('should handle topics with no neighbors gracefully', () => {
      const mockTopic: any = {
        path: () => 'standalone/topic',
        message: {
          payload: {
            format: () => ['standalone_value'],
          },
        },
      }

      const context = service.generateTopicContext(mockTopic)

      expect(context).to.include('Topic: standalone/topic')
      expect(context).to.include('Value: standalone_value')
      // Should not crash, but won't have "Related topics:" section if no neighbors
    })
  })

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
