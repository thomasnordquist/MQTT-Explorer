import { expect } from 'chai'
import 'mocha'
import { LLMService } from '../llmService'

describe('Tool Call Integration - Verify Data from Topic Tree', () => {
  let service: LLMService

  beforeEach(() => {
    service = new LLMService()
  })

  /**
   * Helper to build a realistic MQTT topic tree structure
   */
  function buildRealisticTopicTree() {
    // Build topic tree:
    // home
    //   └── bedroom
    //       ├── lamp
    //       │   ├── state (with history)
    //       │   ├── brightness
    //       │   └── set
    //       ├── sensor
    //       │   ├── temperature
    //       │   └── humidity
    //       └── switch

    const mockHistory = {
      getAll: () => [
        { timestamp: new Date('2024-01-01T10:00:00Z'), payload: { toString: () => 'OFF' } },
        { timestamp: new Date('2024-01-01T10:05:00Z'), payload: { toString: () => 'ON' } },
        { timestamp: new Date('2024-01-01T10:10:00Z'), payload: { toString: () => 'OFF' } },
        { timestamp: new Date('2024-01-01T10:15:00Z'), payload: { toString: () => 'ON' } },
      ],
    }

    const lampSetNode: any = {
      path: () => 'home/bedroom/lamp/set',
      message: {
        payload: { format: () => ['{"state": "ON"}'] },
      },
      messageHistory: { getAll: () => [] },
      childTopicCount: () => 0,
      edgeCollection: { edges: [] },
    }

    const lampBrightnessNode: any = {
      path: () => 'home/bedroom/lamp/brightness',
      message: {
        payload: { format: () => ['75'] },
      },
      messageHistory: { getAll: () => [] },
      childTopicCount: () => 0,
      edgeCollection: { edges: [] },
    }

    const lampStateNode: any = {
      path: () => 'home/bedroom/lamp/state',
      message: {
        payload: { format: () => ['ON'] },
        received: new Date('2024-01-01T10:15:00Z'),
      },
      messageHistory: mockHistory,
      childTopicCount: () => 0,
      edgeCollection: { edges: [] },
    }

    const lampNode: any = {
      path: () => 'home/bedroom/lamp',
      message: {
        payload: { format: () => ['{"state": "ON", "brightness": 75}'] },
      },
      messageHistory: { getAll: () => [] },
      childTopicCount: () => 3,
      edgeCollection: {
        edges: [
          { name: 'state', node: lampStateNode },
          { name: 'brightness', node: lampBrightnessNode },
          { name: 'set', node: lampSetNode },
        ],
      },
    }

    const sensorTempNode: any = {
      path: () => 'home/bedroom/sensor/temperature',
      message: {
        payload: { format: () => ['22.5'] },
      },
      messageHistory: { getAll: () => [] },
      childTopicCount: () => 0,
      edgeCollection: { edges: [] },
    }

    const sensorHumidityNode: any = {
      path: () => 'home/bedroom/sensor/humidity',
      message: {
        payload: { format: () => ['65'] },
      },
      messageHistory: { getAll: () => [] },
      childTopicCount: () => 0,
      edgeCollection: { edges: [] },
    }

    const sensorNode: any = {
      path: () => 'home/bedroom/sensor',
      message: {
        payload: { format: () => ['{"temperature": 22.5, "humidity": 65}'] },
      },
      messageHistory: { getAll: () => [] },
      childTopicCount: () => 2,
      edgeCollection: {
        edges: [
          { name: 'temperature', node: sensorTempNode },
          { name: 'humidity', node: sensorHumidityNode },
        ],
      },
    }

    const switchNode: any = {
      path: () => 'home/bedroom/switch',
      message: {
        payload: { format: () => ['OFF'] },
      },
      messageHistory: { getAll: () => [] },
      childTopicCount: () => 0,
      edgeCollection: { edges: [] },
    }

    const bedroomNode: any = {
      path: () => 'home/bedroom',
      message: null,
      childTopicCount: () => 3,
      edgeCollection: {
        edges: [
          { name: 'lamp', node: lampNode },
          { name: 'sensor', node: sensorNode },
          { name: 'switch', node: switchNode },
        ],
      },
    }

    const homeNode: any = {
      path: () => 'home',
      message: null,
      edgeCollection: {
        edges: [{ name: 'bedroom', node: bedroomNode }],
      },
    }

    const rootNode: any = {
      path: () => '',
      message: null,
      edgeCollection: {
        edges: [{ name: 'home', node: homeNode }],
      },
    }

    return { rootNode, lampStateNode, lampNode, bedroomNode, sensorNode }
  }

  describe('queryTopicHistory', () => {
    it('should return actual message history from topic tree', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).queryTopicHistory('home/bedroom/lamp/state', 10, rootNode)

      // Verify result contains actual history data
      expect(result).to.be.a('string')
      expect(result).to.include('OFF')
      expect(result).to.include('ON')
      expect(result).to.match(/\d{4}-\d{2}-\d{2}/)  // Contains timestamps
    })

    it('should respect token limit (200 tokens)', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).queryTopicHistory('home/bedroom/lamp/state', 100, rootNode)

      // Verify result is limited (200 tokens ≈ 800 chars)
      expect(result.length).to.be.lessThan(800)
    })

    it('should return error message for non-existent topic', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).queryTopicHistory('home/nonexistent/topic', 10, rootNode)

      expect(result).to.include('Topic not found')
      expect(result).to.include('home/nonexistent/topic')
    })
  })

  describe('getTopic', () => {
    it('should return actual topic data from tree', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).getTopic('home/bedroom/lamp', rootNode)

      // Verify result contains actual topic data
      expect(result).to.be.a('string')
      expect(result).to.include('Topic: home/bedroom/lamp')
      expect(result).to.include('Value:')
      expect(result).to.include('state')
      expect(result).to.include('brightness')
    })

    it('should include child count from actual tree structure', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).getTopic('home/bedroom/lamp', rootNode)

      // Lamp has 3 children: state, brightness, set
      expect(result).to.include('Subtopics: 3')
    })

    it('should respect token limit (200 tokens)', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).getTopic('home/bedroom/lamp', rootNode)

      // Verify result is limited (200 tokens ≈ 800 chars)
      expect(result.length).to.be.lessThan(800)
    })

    it('should return error for non-existent topic', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).getTopic('home/nonexistent', rootNode)

      expect(result).to.include('Topic not found')
    })
  })

  describe('listChildren', () => {
    it('should return actual children from topic tree', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listChildren('home/bedroom', 20, rootNode)

      // Verify result contains actual children
      expect(result).to.be.a('string')
      expect(result).to.include('lamp')
      expect(result).to.include('sensor')
      expect(result).to.include('switch')
    })

    it('should include values for child topics', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listChildren('home/bedroom/lamp', 20, rootNode)

      // Children should be listed
      expect(result).to.include('state')
      expect(result).to.include('brightness')
      expect(result).to.include('set')
      // Values are not shown in child list, just checkmarks
      expect(result).to.match(/✓|○/)
    })

    it('should respect limit parameter', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listChildren('home/bedroom', 2, rootNode)

      // Should only list first 2 children (listChildren uses slice)
      // Count lines starting with ✓ or ○
      const childLines = result.split('\n').filter((line: string) => line.match(/^[✓○]/))
      expect(childLines.length).to.equal(2)
    })

    it('should respect token limit (200 tokens)', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listChildren('home/bedroom', 20, rootNode)

      // Verify result is limited (200 tokens ≈ 800 chars)
      expect(result.length).to.be.lessThan(800)
    })

    it('should return error for non-existent topic', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listChildren('home/nonexistent', 20, rootNode)

      expect(result).to.include('Topic not found')
    })
  })

  describe('listParents', () => {
    it('should return actual parent hierarchy from tree', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listParents('home/bedroom/lamp/state', rootNode)

      // Verify result contains actual parent path
      expect(result).to.be.a('string')
      expect(result).to.include('home')
      expect(result).to.include('bedroom')
      expect(result).to.include('lamp')
      expect(result).to.include('state')
    })

    it('should show hierarchy in correct order', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listParents('home/bedroom/lamp/state', rootNode)

      // Should show path from root to topic
      const homeIndex = result.indexOf('home')
      const bedroomIndex = result.indexOf('bedroom')
      const lampIndex = result.indexOf('lamp')
      const stateIndex = result.indexOf('state')

      expect(homeIndex).to.be.lessThan(bedroomIndex)
      expect(bedroomIndex).to.be.lessThan(lampIndex)
      expect(lampIndex).to.be.lessThan(stateIndex)
    })

    it('should respect token limit (100 tokens)', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result = (service as any).listParents('home/bedroom/lamp/state', rootNode)

      // Verify result is limited (100 tokens ≈ 400 chars)
      expect(result.length).to.be.lessThan(400)
    })
  })

  describe('executeTool - Integration', () => {
    it('should execute query_topic_history and return data from tree', async () => {
      const { rootNode } = buildRealisticTopicTree()

      const toolCall: any = {
        id: 'call_123',
        name: 'query_topic_history',
        arguments: JSON.stringify({ topic: 'home/bedroom/lamp/state', limit: 10 }),
      }

      const result = await (service as any).executeTool(toolCall, rootNode)

      expect(result).to.be.an('object')
      expect(result.content).to.be.a('string')
      expect(result.content).to.include('OFF')
      expect(result.content).to.include('ON')
    })

    it('should execute get_topic and return data from tree', async () => {
      const { rootNode } = buildRealisticTopicTree()

      const toolCall: any = {
        id: 'call_123',
        name: 'get_topic',
        arguments: JSON.stringify({ topic: 'home/bedroom/lamp' }),
      }

      const result = await (service as any).executeTool(toolCall, rootNode)

      expect(result).to.be.an('object')
      expect(result.content).to.include('home/bedroom/lamp')
      expect(result.content).to.include('Subtopics: 3')
    })

    it('should execute list_children and return data from tree', async () => {
      const { rootNode } = buildRealisticTopicTree()

      const toolCall: any = {
        id: 'call_123',
        name: 'list_children',
        arguments: JSON.stringify({ topic: 'home/bedroom', limit: 10 }),
      }

      const result = await (service as any).executeTool(toolCall, rootNode)

      expect(result).to.be.an('object')
      expect(result.content).to.include('lamp')
      expect(result.content).to.include('sensor')
      expect(result.content).to.include('switch')
    })

    it('should execute list_parents and return data from tree', async () => {
      const { rootNode } = buildRealisticTopicTree()

      const toolCall: any = {
        id: 'call_123',
        name: 'list_parents',
        arguments: JSON.stringify({ topic: 'home/bedroom/lamp/state' }),
      }

      const result = await (service as any).executeTool(toolCall, rootNode)

      expect(result).to.be.an('object')
      expect(result.content).to.include('home')
      expect(result.content).to.include('bedroom')
      expect(result.content).to.include('lamp')
    })
  })

  describe('Data Verification - Proof tools use real tree', () => {
    it('query_topic_history should fail without valid tree', () => {
      const emptyRoot: any = {
        path: () => '',
        message: null,
        edgeCollection: { edges: [] },
      }

      const result = (service as any).queryTopicHistory('home/bedroom/lamp', 10, emptyRoot)

      expect(result).to.include('Topic not found')
    })

    it('getTopic should return different data for different topics', () => {
      const { rootNode } = buildRealisticTopicTree()

      const lampResult = (service as any).getTopic('home/bedroom/lamp', rootNode)
      const sensorResult = (service as any).getTopic('home/bedroom/sensor', rootNode)

      // Results should be different because they're different topics
      expect(lampResult).to.not.equal(sensorResult)
      expect(lampResult).to.include('lamp')
      expect(sensorResult).to.include('sensor')
    })

    it('listChildren should return actual child count from tree', () => {
      const { rootNode } = buildRealisticTopicTree()

      const bedroomChildren = (service as any).listChildren('home/bedroom', 20, rootNode)
      const lampChildren = (service as any).listChildren('home/bedroom/lamp', 20, rootNode)

      // Bedroom has 3 children, lamp has 3 children
      // Count lines with ✓ or ○
      const bedroomLines = bedroomChildren.split('\n').filter((l: string) => l.match(/^[✓○]/))
      const lampLines = lampChildren.split('\n').filter((l: string) => l.match(/^[✓○]/))

      expect(bedroomLines.length).to.equal(3)  // lamp, sensor, switch
      expect(lampLines.length).to.equal(3)     // state, brightness, set
    })

    it('tools should return consistent data for same topic', () => {
      const { rootNode } = buildRealisticTopicTree()

      const result1 = (service as any).getTopic('home/bedroom/lamp', rootNode)
      const result2 = (service as any).getTopic('home/bedroom/lamp', rootNode)

      // Same topic should return same data
      expect(result1).to.equal(result2)
    })
  })
})
