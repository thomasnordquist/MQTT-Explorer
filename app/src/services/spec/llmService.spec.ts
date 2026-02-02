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

  describe('Tool Execution', () => {
    let service: LLMService

    beforeEach(() => {
      service = new LLMService()
    })

    // Create a mock topic tree for testing
    function createMockTopicTree(): any {
      const mockMessage = (value: string, timestamp?: number) => ({
        payload: {
          format: () => [value],
          toString: () => value,
        },
        timestamp: timestamp || Date.now(),
        retain: false,
      })

      const mockMessageHistory = (messages: any[]) => ({
        getAll: () => messages,
      })

      // Create root node
      const root: any = {
        path: () => 'home',
        message: mockMessage('root'),
        messages: 1,
        childTopicCount: () => 1,
        type: 'string',
        edgeCollection: {
          edges: [],
        },
      }

      // Create living room node
      const livingRoom: any = {
        path: () => 'home/livingroom',
        message: mockMessage('living room'),
        messages: 5,
        childTopicCount: () => 2,
        type: 'string',
        parent: root,
        messageHistory: mockMessageHistory([
          { payload: { toString: () => '20' }, timestamp: Date.now() - 3000 },
          { payload: { toString: () => '21' }, timestamp: Date.now() - 2000 },
          { payload: { toString: () => '22' }, timestamp: Date.now() - 1000 },
        ]),
        edgeCollection: {
          edges: [],
        },
      }

      // Create lamp node
      const lamp: any = {
        path: () => 'home/livingroom/lamp',
        message: mockMessage('{"state":"ON","brightness":80}'),
        messages: 10,
        childTopicCount: () => 0,
        type: 'json',
        parent: livingRoom,
        messageHistory: mockMessageHistory([
          { payload: { toString: () => '{"state":"OFF"}' }, timestamp: Date.now() - 5000 },
          { payload: { toString: () => '{"state":"ON","brightness":50}' }, timestamp: Date.now() - 3000 },
          { payload: { toString: () => '{"state":"ON","brightness":80}' }, timestamp: Date.now() - 1000 },
        ]),
      }

      // Create sensor node
      const sensor: any = {
        path: () => 'home/livingroom/sensor',
        message: mockMessage('{"temperature":22.5,"humidity":45}'),
        messages: 100,
        childTopicCount: () => 0,
        type: 'json',
        parent: livingRoom,
      }

      // Wire up edges
      livingRoom.edgeCollection.edges = [
        { name: 'lamp', node: lamp },
        { name: 'sensor', node: sensor },
      ]

      root.edgeCollection.edges = [{ name: 'livingroom', node: livingRoom }]

      return root
    }

    describe('findTopicNode', () => {
      it('should find topic node by exact path', () => {
        const root = createMockTopicTree()
        const found = (service as any).findTopicNode('home/livingroom/lamp', root)
        expect(found).to.not.be.null
        expect(found?.path()).to.equal('home/livingroom/lamp')
      })

      it('should return null for non-existent path', () => {
        const root = createMockTopicTree()
        const found = (service as any).findTopicNode('home/nonexistent', root)
        expect(found).to.be.null
      })
    })

    describe('findRootNode', () => {
      it('should find root node from deeply nested node', () => {
        const root = createMockTopicTree()
        // Get the lamp node (deeply nested)
        const lamp = (service as any).findTopicNode('home/livingroom/lamp', root)
        expect(lamp).to.not.be.null
        
        // Find root from lamp node
        const foundRoot = (service as any).findRootNode(lamp)
        expect(foundRoot).to.not.be.null
        expect(foundRoot?.path()).to.equal('home')
        expect(foundRoot).to.equal(root)
      })

      it('should return null for undefined node', () => {
        const foundRoot = (service as any).findRootNode(undefined)
        expect(foundRoot).to.be.null
      })

      it('should return node itself if it has no parent (is root)', () => {
        const root = createMockTopicTree()
        const foundRoot = (service as any).findRootNode(root)
        expect(foundRoot).to.equal(root)
      })
    })

    describe('queryTopicHistory', () => {
      it('should query topic history with limit', () => {
        const root = createMockTopicTree()
        const result = (service as any).queryTopicHistory('home/livingroom/lamp', 3, root)
        
        expect(result).to.be.a('string')
        expect(result).to.include('{"state":"OFF"}')
        expect(result).to.include('{"state":"ON","brightness":50}')
        expect(result).to.include('{"state":"ON","brightness":80}')
      })

      it('should handle topic not found', () => {
        const root = createMockTopicTree()
        const result = (service as any).queryTopicHistory('home/nonexistent', 10, root)
        
        expect(result).to.include('Topic not found')
      })

      it('should limit history to 200 tokens', () => {
        const root = createMockTopicTree()
        const result = (service as any).queryTopicHistory('home/livingroom/lamp', 20, root)
        
        // Should be limited to ~800 characters (200 tokens * 4)
        expect(result.length).to.be.lessThan(1000)
      })
    })

    describe('getTopic', () => {
      it('should get topic details', () => {
        const root = createMockTopicTree()
        const result = (service as any).getTopic('home/livingroom/lamp', root)
        
        expect(result).to.include('Topic: home/livingroom/lamp')
        expect(result).to.include('Value:')
        expect(result).to.include('Messages:')
      })

      it('should handle topic not found', () => {
        const root = createMockTopicTree()
        const result = (service as any).getTopic('home/nonexistent', root)
        
        expect(result).to.include('Topic not found')
      })
    })

    describe('listChildren', () => {
      it('should list child topics', () => {
        const root = createMockTopicTree()
        const result = (service as any).listChildren('home/livingroom', 10, root)
        
        expect(result).to.include('Child topics')
        expect(result).to.include('home/livingroom/lamp')
        expect(result).to.include('home/livingroom/sensor')
      })

      it('should handle no children', () => {
        const root = createMockTopicTree()
        const result = (service as any).listChildren('home/livingroom/lamp', 10, root)
        
        expect(result).to.include('No child topics found')
      })

      it('should limit to 200 tokens', () => {
        const root = createMockTopicTree()
        const result = (service as any).listChildren('home/livingroom', 50, root)
        
        // Should be limited to ~800 characters
        expect(result.length).to.be.lessThan(1000)
      })
    })

    describe('listParents', () => {
      it('should list parent hierarchy', () => {
        const root = createMockTopicTree()
        const result = (service as any).listParents('home/livingroom/lamp', root)
        
        expect(result).to.include('Parent hierarchy')
        expect(result).to.include('home')
        expect(result).to.include('home/livingroom')
        expect(result).to.include('home/livingroom/lamp (current)')
      })

      it('should handle root level topic', () => {
        const root = createMockTopicTree()
        const result = (service as any).listParents('home', root)
        
        expect(result).to.include('No parent topics')
        expect(result).to.include('root level')
      })

      it('should limit to 100 tokens', () => {
        const root = createMockTopicTree()
        const result = (service as any).listParents('home/livingroom/lamp', root)
        
        // Should be limited to ~400 characters (100 tokens * 4)
        expect(result.length).to.be.lessThan(500)
      })
    })

    describe('executeTool', () => {
      it('should execute query_topic_history tool', async () => {
        const root = createMockTopicTree()
        const toolCall = {
          id: 'call_123',
          name: 'query_topic_history',
          arguments: '{"topic":"home/livingroom/lamp","limit":3}',
        }

        const result = await (service as any).executeTool(toolCall, root)
        
        expect(result.tool_call_id).to.equal('call_123')
        expect(result.name).to.equal('query_topic_history')
        expect(result.content).to.be.a('string')
        expect(result.content).to.include('state')
      })

      it('should execute get_topic tool', async () => {
        const root = createMockTopicTree()
        const toolCall = {
          id: 'call_456',
          name: 'get_topic',
          arguments: '{"topic":"home/livingroom/sensor"}',
        }

        const result = await (service as any).executeTool(toolCall, root)
        
        expect(result.tool_call_id).to.equal('call_456')
        expect(result.name).to.equal('get_topic')
        expect(result.content).to.include('Topic: home/livingroom/sensor')
      })

      it('should execute list_children tool', async () => {
        const root = createMockTopicTree()
        const toolCall = {
          id: 'call_789',
          name: 'list_children',
          arguments: '{"topic":"home/livingroom","limit":10}',
        }

        const result = await (service as any).executeTool(toolCall, root)
        
        expect(result.tool_call_id).to.equal('call_789')
        expect(result.name).to.equal('list_children')
        expect(result.content).to.include('lamp')
        expect(result.content).to.include('sensor')
      })

      it('should execute list_parents tool', async () => {
        const root = createMockTopicTree()
        const toolCall = {
          id: 'call_abc',
          name: 'list_parents',
          arguments: '{"topic":"home/livingroom/lamp"}',
        }

        const result = await (service as any).executeTool(toolCall, root)
        
        expect(result.tool_call_id).to.equal('call_abc')
        expect(result.name).to.equal('list_parents')
        expect(result.content).to.include('Parent hierarchy')
      })

      it('should handle unknown tool', async () => {
        const root = createMockTopicTree()
        const toolCall = {
          id: 'call_xyz',
          name: 'unknown_tool',
          arguments: '{}',
        }

        const result = await (service as any).executeTool(toolCall, root)
        
        expect(result.content).to.include('Unknown tool')
      })

      it('should handle invalid arguments', async () => {
        const root = createMockTopicTree()
        const toolCall = {
          id: 'call_error',
          name: 'get_topic',
          arguments: 'invalid json',
        }

        const result = await (service as any).executeTool(toolCall, root)
        
        expect(result.content).to.include('Error executing tool')
      })
    })
  })

  describe('parseResponse', () => {
    let service: LLMService

    beforeEach(() => {
      service = new LLMService()
    })

    it('should parse question proposals with backticks format', () => {
      const response = `Here is some text.

\`\`\`question-proposal
{
  "question": "What is the temperature?",
  "category": "analysis"
}
\`\`\`

\`\`\`question-proposal
{
  "question": "How do I turn it off?",
  "category": "control"
}
\`\`\`

More text here.`

      const result = service.parseResponse(response)

      expect(result.questions).to.have.length(2)
      expect(result.questions[0].question).to.equal('What is the temperature?')
      expect(result.questions[0].category).to.equal('analysis')
      expect(result.questions[1].question).to.equal('How do I turn it off?')
      expect(result.questions[1].category).to.equal('control')
      expect(result.text).to.include('Here is some text')
      expect(result.text).to.include('More text here')
      expect(result.text).not.to.include('```question-proposal')
    })

    it('should parse question proposals without backticks (bare JSON)', () => {
      const response = `Here is some analysis.

{"question": "What devices are connected?", "category": "analysis"}

{"question": "Can I automate this?", "category": "optimization"}

That's all.`

      const result = service.parseResponse(response)

      expect(result.questions).to.have.length(2)
      expect(result.questions[0].question).to.equal('What devices are connected?')
      expect(result.questions[0].category).to.equal('analysis')
      expect(result.questions[1].question).to.equal('Can I automate this?')
      expect(result.questions[1].category).to.equal('optimization')
      expect(result.text).to.include('Here is some analysis')
      expect(result.text).to.include("That's all")
      expect(result.text).not.to.include('{"question"')
    })

    it('should parse question proposals without category', () => {
      const response = `Some text.

{"question": "What is this?"}

End.`

      const result = service.parseResponse(response)

      expect(result.questions).to.have.length(1)
      expect(result.questions[0].question).to.equal('What is this?')
      expect(result.questions[0].category).to.be.undefined
    })

    it('should handle mixed format (backticks and bare JSON)', () => {
      const response = `Text here.

\`\`\`question-proposal
{
  "question": "First question?",
  "category": "analysis"
}
\`\`\`

{"question": "Second question?", "category": "control"}

Done.`

      const result = service.parseResponse(response)

      expect(result.questions).to.have.length(2)
      expect(result.questions[0].question).to.equal('First question?')
      expect(result.questions[1].question).to.equal('Second question?')
    })

    it('should parse message proposals with backticks', () => {
      const response = `You can turn off the light.

\`\`\`proposal
{
  "topic": "home/light/set",
  "payload": "OFF",
  "qos": 0,
  "description": "Turn off the light"
}
\`\`\``

      const result = service.parseResponse(response)

      expect(result.proposals).to.have.length(1)
      expect(result.proposals[0].topic).to.equal('home/light/set')
      expect(result.proposals[0].payload).to.equal('OFF')
      expect(result.proposals[0].description).to.equal('Turn off the light')
      expect(result.text).not.to.include('```proposal')
    })

    it('should handle response with no proposals or questions', () => {
      const response = 'This is a simple response with no proposals.'

      const result = service.parseResponse(response)

      expect(result.questions).to.have.length(0)
      expect(result.proposals).to.have.length(0)
      expect(result.text).to.equal('This is a simple response with no proposals.')
    })

    it('should handle malformed JSON gracefully', () => {
      const response = `Some text.

{"question": "Valid question?", "category": "analysis"}

{invalid json here}

{"question": "Another valid?"}

Done.`

      const result = service.parseResponse(response)

      // Should parse the valid questions and skip the invalid one
      expect(result.questions).to.have.length(2)
      expect(result.questions[0].question).to.equal('Valid question?')
      expect(result.questions[1].question).to.equal('Another valid?')
    })

    it('should remove bare JSON from display text', () => {
      const response = `Here is the answer: The device is working fine.

{"question": "Is it secure?", "category": "troubleshooting"}

You can check the logs for more details.`

      const result = service.parseResponse(response)

      expect(result.text).to.include('The device is working fine')
      expect(result.text).to.include('You can check the logs')
      expect(result.text).not.to.include('{"question"')
      expect(result.text).not.to.include('"Is it secure?"')
    })
  })
})
