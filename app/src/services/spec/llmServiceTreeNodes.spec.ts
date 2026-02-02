import { expect } from 'chai'
import { LLMService } from '../llmService'

describe('LLMService TreeNode Functions', () => {
  let llmService: LLMService
  let mockRootNode: any
  
  beforeEach(() => {
    llmService = new LLMService()
    
    // Build a comprehensive mock tree structure
    // Root
    //   ├── home
    //   │   ├── bedroom
    //   │   │   ├── lamp
    //   │   │   │   ├── state (with message history)
    //   │   │   │   ├── brightness
    //   │   │   │   └── color
    //   │   │   └── sensor
    //   │   │       ├── temperature
    //   │   │       └── humidity
    //   │   └── kitchen
    //   │       ├── coffee_maker
    //   │       └── lamp
    //   └── devices
    //       └── /sensor (topic with leading slash)
    
    mockRootNode = {
      path: () => '',
      parent: null,
      edgeCollection: { edges: [] },
    }
    
    // Create home branch
    const homeNode: any = {
      name: 'home',
      path: () => 'home',
      parent: mockRootNode,
      edgeCollection: { edges: [] },
      childTopicCount: () => 2,
    }
    const homeEdge = { name: 'home', node: homeNode }
    mockRootNode.edgeCollection.edges.push(homeEdge)
    
    // Create home/bedroom
    const bedroomNode: any = {
      name: 'bedroom',
      path: () => 'home/bedroom',
      parent: homeNode,
      edgeCollection: { edges: [] },
      childTopicCount: () => 2,
    }
    const bedroomEdge = { name: 'bedroom', node: bedroomNode }
    homeNode.edgeCollection.edges.push(bedroomEdge)
    
    // Create home/bedroom/lamp
    const lampNode: any = {
      name: 'lamp',
      path: () => 'home/bedroom/lamp',
      parent: bedroomNode,
      message: {
        payload: { format: () => [JSON.stringify({ state: 'ON', brightness: 75 })] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 3,
    }
    const lampEdge = { name: 'lamp', node: lampNode }
    bedroomNode.edgeCollection.edges.push(lampEdge)
    
    // Create home/bedroom/lamp/state (with message history)
    const mockHistory = {
      getAll: () => [
        { timestamp: new Date('2024-01-01T10:00:00'), payload: { format: () => ['OFF'] } },
        { timestamp: new Date('2024-01-01T10:05:00'), payload: { format: () => ['ON'] } },
        { timestamp: new Date('2024-01-01T10:10:00'), payload: { format: () => ['OFF'] } },
        { timestamp: new Date('2024-01-01T10:15:00'), payload: { format: () => ['ON'] } },
      ],
    }
    
    const stateNode: any = {
      name: 'state',
      path: () => 'home/bedroom/lamp/state',
      parent: lampNode,
      message: {
        payload: { format: () => ['ON'] },
        receivedAt: new Date(),
      },
      messageHistory: mockHistory,
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const stateEdge = { name: 'state', node: stateNode }
    lampNode.edgeCollection.edges.push(stateEdge)
    
    // Create home/bedroom/lamp/brightness
    const brightnessNode: any = {
      name: 'brightness',
      path: () => 'home/bedroom/lamp/brightness',
      parent: lampNode,
      message: {
        payload: { format: () => ['75'] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const brightnessEdge = { name: 'brightness', node: brightnessNode }
    lampNode.edgeCollection.edges.push(brightnessEdge)
    
    // Create home/bedroom/lamp/color
    const colorNode: any = {
      name: 'color',
      path: () => 'home/bedroom/lamp/color',
      parent: lampNode,
      message: {
        payload: { format: () => ['#FF00FF'] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const colorEdge = { name: 'color', node: colorNode }
    lampNode.edgeCollection.edges.push(colorEdge)
    
    // Create home/bedroom/sensor
    const sensorNode: any = {
      name: 'sensor',
      path: () => 'home/bedroom/sensor',
      parent: bedroomNode,
      edgeCollection: { edges: [] },
      childTopicCount: () => 2,
    }
    const sensorEdge = { name: 'sensor', node: sensorNode }
    bedroomNode.edgeCollection.edges.push(sensorEdge)
    
    // Create home/bedroom/sensor/temperature
    const tempNode: any = {
      name: 'temperature',
      path: () => 'home/bedroom/sensor/temperature',
      parent: sensorNode,
      message: {
        payload: { format: () => ['22.5'] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const tempEdge = { name: 'temperature', node: tempNode }
    sensorNode.edgeCollection.edges.push(tempEdge)
    
    // Create home/bedroom/sensor/humidity
    const humidityNode: any = {
      name: 'humidity',
      path: () => 'home/bedroom/sensor/humidity',
      parent: sensorNode,
      message: {
        payload: { format: () => ['65'] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const humidityEdge = { name: 'humidity', node: humidityNode }
    sensorNode.edgeCollection.edges.push(humidityEdge)
    
    // Create home/kitchen
    const kitchenNode: any = {
      name: 'kitchen',
      path: () => 'home/kitchen',
      parent: homeNode,
      edgeCollection: { edges: [] },
      childTopicCount: () => 2,
    }
    const kitchenEdge = { name: 'kitchen', node: kitchenNode }
    homeNode.edgeCollection.edges.push(kitchenEdge)
    
    // Create home/kitchen/coffee_maker
    const coffeeMakerNode: any = {
      name: 'coffee_maker',
      path: () => 'home/kitchen/coffee_maker',
      parent: kitchenNode,
      message: {
        payload: { format: () => [JSON.stringify({ heater: 'on', temperature: 92.5, waterLevel: 0.5 })] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const coffeeMakerEdge = { name: 'coffee_maker', node: coffeeMakerNode }
    kitchenNode.edgeCollection.edges.push(coffeeMakerEdge)
    
    // Create home/kitchen/lamp
    const kitchenLampNode: any = {
      name: 'lamp',
      path: () => 'home/kitchen/lamp',
      parent: kitchenNode,
      message: {
        payload: { format: () => ['OFF'] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const kitchenLampEdge = { name: 'lamp', node: kitchenLampNode }
    kitchenNode.edgeCollection.edges.push(kitchenLampEdge)
    
    // Create devices branch
    const devicesNode: any = {
      name: 'devices',
      path: () => 'devices',
      parent: mockRootNode,
      edgeCollection: { edges: [] },
      childTopicCount: () => 1,
    }
    const devicesEdge = { name: 'devices', node: devicesNode }
    mockRootNode.edgeCollection.edges.push(devicesEdge)
    
    // Create devices//sensor (topic with leading slash in name)
    const slashSensorNode: any = {
      name: '/sensor',
      path: () => 'devices//sensor',
      parent: devicesNode,
      message: {
        payload: { format: () => ['test'] },
        receivedAt: new Date(),
      },
      messageHistory: { getAll: () => [] },
      edgeCollection: { edges: [] },
      childTopicCount: () => 0,
    }
    const slashSensorEdge = { name: '/sensor', node: slashSensorNode }
    devicesNode.edgeCollection.edges.push(slashSensorEdge)
  })
  
  describe('findRootNode', () => {
    it('should find root from deeply nested node', () => {
      // Get a deeply nested node (home/bedroom/lamp/state)
      const homeEdge = mockRootNode.edgeCollection.edges.find(e => e.name === 'home')!
      const homeNode = homeEdge.node
      const bedroomEdge = homeNode.edgeCollection.edges.find(e => e.name === 'bedroom')!
      const bedroomNode = bedroomEdge.node
      const lampEdge = bedroomNode.edgeCollection.edges.find(e => e.name === 'lamp')!
      const lampNode = lampEdge.node
      const stateEdge = lampNode.edgeCollection.edges.find(e => e.name === 'state')!
      const stateNode = stateEdge.node
      
      const result = (llmService as any).findRootNode(stateNode)
      
      expect(result).to.equal(mockRootNode)
      expect(result.path()).to.equal('')
    })
    
    it('should return null for undefined node', () => {
      const result = (llmService as any).findRootNode(undefined)
      expect(result).to.be.null
    })
    
    it('should return null for null node', () => {
      const result = (llmService as any).findRootNode(null)
      expect(result).to.be.null
    })
    
    it('should return node itself if it has no parent (is root)', () => {
      const result = (llmService as any).findRootNode(mockRootNode)
      expect(result).to.equal(mockRootNode)
    })
    
    it('should traverse multiple levels to root', () => {
      const homeEdge = mockRootNode.edgeCollection.edges.find(e => e.name === 'home')!
      const homeNode = homeEdge.node
      const kitchenEdge = homeNode.edgeCollection.edges.find(e => e.name === 'kitchen')!
      const kitchenNode = kitchenEdge.node
      
      const result = (llmService as any).findRootNode(kitchenNode)
      
      expect(result).to.equal(mockRootNode)
    })
  })
  
  describe('findTopicNode', () => {
    it('should find root node with empty path', () => {
      const result = (llmService as any).findTopicNode('', mockRootNode)
      expect(result).to.equal(mockRootNode)
    })
    
    it('should find top-level topic', () => {
      const result = (llmService as any).findTopicNode('home', mockRootNode)
      expect(result).to.not.be.null
      expect(result?.name).to.equal('home')
    })
    
    it('should find nested topic', () => {
      const result = (llmService as any).findTopicNode('home/bedroom/lamp', mockRootNode)
      expect(result).to.not.be.null
      expect(result?.name).to.equal('lamp')
      expect(result?.path()).to.equal('home/bedroom/lamp')
    })
    
    it('should find deeply nested topic', () => {
      const result = (llmService as any).findTopicNode('home/bedroom/lamp/state', mockRootNode)
      expect(result).to.not.be.null
      expect(result?.name).to.equal('state')
      expect(result?.path()).to.equal('home/bedroom/lamp/state')
    })
    
    it('should return null for non-existent topic', () => {
      const result = (llmService as any).findTopicNode('home/nonexistent', mockRootNode)
      expect(result).to.be.null
    })
    
    it('should return null for non-existent nested topic', () => {
      const result = (llmService as any).findTopicNode('home/bedroom/nonexistent/topic', mockRootNode)
      expect(result).to.be.null
    })
    
    it('should find sibling topics correctly', () => {
      const lamp1 = (llmService as any).findTopicNode('home/bedroom/lamp', mockRootNode)
      const lamp2 = (llmService as any).findTopicNode('home/kitchen/lamp', mockRootNode)
      
      expect(lamp1).to.not.be.null
      expect(lamp2).to.not.be.null
      expect(lamp1).to.not.equal(lamp2)
      expect(lamp1?.path()).to.equal('home/bedroom/lamp')
      expect(lamp2?.path()).to.equal('home/kitchen/lamp')
    })
    
    it('should handle topic with leading slash in name', () => {
      const result = (llmService as any).findTopicNode('devices//sensor', mockRootNode)
      expect(result).to.not.be.null
      expect(result?.name).to.equal('/sensor')
    })
    
    it('should return null when starting from null node', () => {
      const result = (llmService as any).findTopicNode('home/bedroom', null)
      expect(result).to.be.null
    })
    
    it('should return null when starting from undefined node', () => {
      const result = (llmService as any).findTopicNode('home/bedroom', undefined)
      expect(result).to.be.null
    })
    
    it('should find multiple children under same parent', () => {
      const temp = (llmService as any).findTopicNode('home/bedroom/sensor/temperature', mockRootNode)
      const humidity = (llmService as any).findTopicNode('home/bedroom/sensor/humidity', mockRootNode)
      
      expect(temp).to.not.be.null
      expect(humidity).to.not.be.null
      expect(temp?.name).to.equal('temperature')
      expect(humidity?.name).to.equal('humidity')
    })
    
    it('should not match partial paths', () => {
      // Should not match "home/bed" when only "home/bedroom" exists
      const result = (llmService as any).findTopicNode('home/bed', mockRootNode)
      expect(result).to.be.null
    })
  })
  
  describe('queryTopicHistory', () => {
    it('should return message history for topic with history', () => {
      const result = (llmService as any).queryTopicHistory(
        { topic: 'home/bedroom/lamp/state', limit: 10 },
        mockRootNode
      )
      
      expect(result).to.be.a('string')
      expect(result).to.include('OFF')
      expect(result).to.include('ON')
      expect(result).to.include('2024-01-01')
    })
    
    it('should respect limit parameter', () => {
      const result = (llmService as any).queryTopicHistory(
        { topic: 'home/bedroom/lamp/state', limit: 2 },
        mockRootNode
      )
      
      const lines = result.split('\n').filter((l: string) => l.trim().length > 0)
      // Should have at most 2 history entries + header
      expect(lines.length).to.be.at.most(3)
    })
    
    it('should return error for non-existent topic', () => {
      const result = (llmService as any).queryTopicHistory(
        { topic: 'home/nonexistent', limit: 10 },
        mockRootNode
      )
      
      expect(result).to.include('Topic not found')
    })
    
    it('should return message for topic with no history', () => {
      const result = (llmService as any).queryTopicHistory(
        { topic: 'home/bedroom/lamp/brightness', limit: 10 },
        mockRootNode
      )
      
      expect(result).to.be.a('string')
      // Should still return something, even if no history
    })
    
    it('should handle root level topics', () => {
      const result = (llmService as any).queryTopicHistory(
        { topic: 'home', limit: 10 },
        mockRootNode
      )
      
      expect(result).to.be.a('string')
    })
    
    it('should respect token limit', () => {
      const result = (llmService as any).queryTopicHistory(
        { topic: 'home/bedroom/lamp/state', limit: 100 },
        mockRootNode
      )
      
      // Result should be limited to ~800 chars (200 tokens * 4 chars/token)
      expect(result.length).to.be.at.most(850)
    })
  })
  
  describe('getTopic', () => {
    it('should return topic details for existing topic', () => {
      const result = (llmService as any).getTopic(
        { topic: 'home/bedroom/lamp' },
        mockRootNode
      )
      
      expect(result).to.be.a('string')
      expect(result).to.include('home/bedroom/lamp')
      expect(result).to.include('ON')
      expect(result).to.include('brightness')
    })
    
    it('should include child count', () => {
      const result = (llmService as any).getTopic(
        { topic: 'home/bedroom/lamp' },
        mockRootNode
      )
      
      expect(result).to.include('Subtopics: 3')
    })
    
    it('should return error for non-existent topic', () => {
      const result = (llmService as any).getTopic(
        { topic: 'home/nonexistent' },
        mockRootNode
      )
      
      expect(result).to.include('Topic not found')
    })
    
    it('should handle topic with JSON payload', () => {
      const result = (llmService as any).getTopic(
        { topic: 'home/kitchen/coffee_maker' },
        mockRootNode
      )
      
      expect(result).to.include('heater')
      expect(result).to.include('temperature')
      expect(result).to.include('92.5')
    })
    
    it('should handle topic with simple payload', () => {
      const result = (llmService as any).getTopic(
        { topic: 'home/bedroom/lamp/brightness' },
        mockRootNode
      )
      
      expect(result).to.include('75')
    })
    
    it('should handle topic with no children', () => {
      const result = (llmService as any).getTopic(
        { topic: 'home/bedroom/lamp/state' },
        mockRootNode
      )
      
      expect(result).to.include('Subtopics: 0')
    })
    
    it('should respect token limit', () => {
      const result = (llmService as any).getTopic(
        { topic: 'home/bedroom/lamp' },
        mockRootNode
      )
      
      // Result should be limited to ~800 chars (200 tokens * 4 chars/token)
      expect(result.length).to.be.at.most(850)
    })
  })
  
  describe('listChildren', () => {
    it('should list children of a topic', () => {
      const result = (llmService as any).listChildren(
        { topic: 'home/bedroom/lamp', limit: 20 },
        mockRootNode
      )
      
      expect(result).to.be.a('string')
      expect(result).to.include('state')
      expect(result).to.include('brightness')
      expect(result).to.include('color')
    })
    
    it('should show child count', () => {
      const result = (llmService as any).listChildren(
        { topic: 'home/bedroom/lamp', limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('Child topics (3)')
    })
    
    it('should list root level topics for empty path', () => {
      const result = (llmService as any).listChildren(
        { topic: '', limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('home')
      expect(result).to.include('devices')
    })
    
    it('should list root level topics for null topic', () => {
      const result = (llmService as any).listChildren(
        { topic: null, limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('home')
      expect(result).to.include('devices')
    })
    
    it('should list root level topics for undefined topic', () => {
      const result = (llmService as any).listChildren(
        { topic: undefined, limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('home')
      expect(result).to.include('devices')
    })
    
    it('should respect limit parameter', () => {
      const result = (llmService as any).listChildren(
        { topic: 'home/bedroom/lamp', limit: 2 },
        mockRootNode
      )
      
      const lines = result.split('\n').filter((l: string) => l.includes('✓'))
      expect(lines.length).to.be.at.most(2)
    })
    
    it('should return error for non-existent topic', () => {
      const result = (llmService as any).listChildren(
        { topic: 'home/nonexistent', limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('Topic not found')
    })
    
    it('should return message for topic with no children', () => {
      const result = (llmService as any).listChildren(
        { topic: 'home/bedroom/lamp/state', limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('No child topics')
    })
    
    it('should show subtopic count for children', () => {
      const result = (llmService as any).listChildren(
        { topic: 'home/bedroom', limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('lamp (3 subtopics)')
      expect(result).to.include('sensor (2 subtopics)')
    })
    
    it('should handle topic with leading slash in name', () => {
      const result = (llmService as any).listChildren(
        { topic: 'devices', limit: 20 },
        mockRootNode
      )
      
      expect(result).to.include('/sensor')
    })
    
    it('should respect token limit', () => {
      const result = (llmService as any).listChildren(
        { topic: 'home', limit: 100 },
        mockRootNode
      )
      
      // Result should be limited to ~800 chars (200 tokens * 4 chars/token)
      expect(result.length).to.be.at.most(850)
    })
  })
  
  describe('listParents', () => {
    it('should list parent hierarchy', () => {
      const result = (llmService as any).listParents(
        { topic: 'home/bedroom/lamp/state' },
        mockRootNode
      )
      
      expect(result).to.be.a('string')
      expect(result).to.include('home')
      expect(result).to.include('bedroom')
      expect(result).to.include('lamp')
    })
    
    it('should show hierarchy in correct order', () => {
      const result = (llmService as any).listParents(
        { topic: 'home/bedroom/lamp/state' },
        mockRootNode
      )
      
      const homeIndex = result.indexOf('home')
      const bedroomIndex = result.indexOf('bedroom')
      const lampIndex = result.indexOf('lamp')
      
      expect(homeIndex).to.be.lessThan(bedroomIndex)
      expect(bedroomIndex).to.be.lessThan(lampIndex)
    })
    
    it('should return message for root level topic', () => {
      const result = (llmService as any).listParents(
        { topic: 'home' },
        mockRootNode
      )
      
      expect(result).to.be.a('string')
    })
    
    it('should return error for non-existent topic', () => {
      const result = (llmService as any).listParents(
        { topic: 'home/nonexistent' },
        mockRootNode
      )
      
      expect(result).to.include('Topic not found')
    })
    
    it('should handle deeply nested topics', () => {
      const result = (llmService as any).listParents(
        { topic: 'home/bedroom/sensor/temperature' },
        mockRootNode
      )
      
      expect(result).to.include('home')
      expect(result).to.include('bedroom')
      expect(result).to.include('sensor')
    })
    
    it('should respect token limit', () => {
      const result = (llmService as any).listParents(
        { topic: 'home/bedroom/lamp/state' },
        mockRootNode
      )
      
      // Result should be limited to ~400 chars (100 tokens * 4 chars/token)
      expect(result.length).to.be.at.most(450)
    })
  })
  
  describe('Edge Cases and Error Handling', () => {
    it('findTopicNode should handle empty path segments gracefully', () => {
      // Path with double slash: home//lamp (creates empty segment)
      const result = (llmService as any).findTopicNode('home//bedroom', mockRootNode)
      // Should handle gracefully (might not find or might skip empty)
      // Just ensure it doesn't crash
      expect(result).to.satisfy((r: any) => r === null || r !== undefined)
    })
    
    it('functions should handle null rootNode', () => {
      const getTopic = (llmService as any).getTopic({ topic: 'home' }, null)
      const listChildren = (llmService as any).listChildren({ topic: 'home', limit: 10 }, null)
      const listParents = (llmService as any).listParents({ topic: 'home' }, null)
      const queryHistory = (llmService as any).queryTopicHistory({ topic: 'home', limit: 10 }, null)
      
      expect(getTopic).to.include('Topic not found')
      expect(listChildren).to.include('Topic not found')
      expect(listParents).to.include('Topic not found')
      expect(queryHistory).to.include('Topic not found')
    })
    
    it('functions should handle very long topic paths', () => {
      const longPath = 'a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z'
      const result = (llmService as any).findTopicNode(longPath, mockRootNode)
      // Should handle gracefully without crashing
      expect(result).to.be.null
    })
    
    it('listChildren should handle topic with many children', () => {
      // Create a topic with many children
      const manyChildrenNode: any = {
        name: 'many',
        path: () => 'many',
        parent: mockRootNode,
        edgeCollection: { edges: [] },
        childTopicCount: () => 50,
      }
      
      for (let i = 0; i < 50; i++) {
        const childNode: any = {
          name: `child${i}`,
          path: () => `many/child${i}`,
          parent: manyChildrenNode,
          message: {
            payload: { format: () => [`value${i}`] },
            receivedAt: new Date(),
          },
          messageHistory: { getAll: () => [] },
          edgeCollection: { edges: [] },
          childTopicCount: () => 0,
        }
        const childEdge = { name: `child${i}`, node: childNode }
        manyChildrenNode.edgeCollection.edges.push(childEdge)
      }
      
      const manyEdge = { name: 'many', node: manyChildrenNode }
      mockRootNode.edgeCollection.edges.push(manyEdge)
      
      const result = (llmService as any).listChildren(
        { topic: 'many', limit: 100 },
        mockRootNode
      )
      
      // Should be limited by token limit, not crash
      expect(result).to.be.a('string')
      expect(result.length).to.be.at.most(850)
    })
  })
  
  describe('Topic Name Preservation', () => {
    it('should not modify topic names with leading slashes', () => {
      const result = (llmService as any).findTopicNode('devices//sensor', mockRootNode)
      expect(result).to.not.be.null
      expect(result?.name).to.equal('/sensor')
      // Name should be preserved exactly, not normalized
    })
    
    it('should distinguish between "topic" and "/topic"', () => {
      // Create two different topics: one without slash, one with
      const normalNode: any = {
        name: 'sensor',
        path: () => 'test/sensor',
        message: { payload: { format: () => ['normal'] }, receivedAt: new Date() },
        messageHistory: { getAll: () => [] },
        edgeCollection: { edges: [] },
        childTopicCount: () => 0,
      }
      const normalEdge = { name: 'sensor', node: normalNode }
      
      const slashNode: any = {
        name: '/sensor',
        path: () => 'test//sensor',
        message: { payload: { format: () => ['slash'] }, receivedAt: new Date() },
        messageHistory: { getAll: () => [] },
        edgeCollection: { edges: [] },
        childTopicCount: () => 0,
      }
      const slashEdge = { name: '/sensor', node: slashNode }
      
      const testNode: any = {
        name: 'test',
        path: () => 'test',
        parent: mockRootNode,
        edgeCollection: { edges: [normalEdge, slashEdge] },
        childTopicCount: () => 2,
      }
      const testEdge = { name: 'test', node: testNode }
      mockRootNode.edgeCollection.edges.push(testEdge)
      
      const normal = (llmService as any).findTopicNode('test/sensor', mockRootNode)
      const slash = (llmService as any).findTopicNode('test//sensor', mockRootNode)
      
      expect(normal).to.not.be.null
      expect(slash).to.not.be.null
      expect(normal?.name).to.equal('sensor')
      expect(slash?.name).to.equal('/sensor')
      expect(normal?.message.payload.format()[0]).to.equal('normal')
      expect(slash?.message.payload.format()[0]).to.equal('slash')
    })
    
    it('should preserve exact topic paths in results', () => {
      const result = (llmService as any).getTopic(
        { topic: 'devices//sensor' },
        mockRootNode
      )
      
      expect(result).to.include('devices//sensor')
      // Path should not be normalized or modified
    })
  })
})
