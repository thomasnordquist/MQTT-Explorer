import 'mocha'
import './TreeNode.findNode'

import { TreeNodeFactory } from '../'
import { expect } from 'chai'

describe('TreeNodeFactory', () => {
  it('root node must not have a sourceEdge', () => {
    const topic = 'foo/bar'
    const edges = topic.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(edges, undefined)

    expect(leaf.firstNode().sourceEdge).to.eq(undefined)
  })

  it('should create node', () => {
    const topic = 'foo/bar'
    const edges = topic.split('/')
    const node = TreeNodeFactory.fromEdgesAndValue(edges, '5')

    if (!node.sourceEdge || !node.sourceEdge.source || !node.message) {
      expect.fail('should not happen')
      return
    }

    expect(node).to.not.eq(undefined)
    expect(node.sourceEdge.name).to.eq('bar')
    expect(node.message.value).to.eq('5')

    const foo = node.firstNode().findNode('foo')
    expect(foo && foo.sourceEdge && foo.sourceEdge.name).to.eq('foo')
  })

  it('node should contain edges in order', () => {
    const topic = 'foo/bar/baz'
    const edges = topic.split('/')
    const node = TreeNodeFactory.fromEdgesAndValue(edges, '5')

    if (!node.sourceEdge || !node.sourceEdge.source || !node.message) {
      expect.fail('should not happen')
      return
    }

    expect(node.message.value).to.eq('5')
    expect(node.sourceEdge.name).to.eq('baz')

    const barNode = node.sourceEdge.source
    if (!barNode || !barNode.sourceEdge) {
      expect.fail('should not fail')
      return
    }
    expect(barNode.sourceEdge.name).to.eq('bar')

    const fooNode = barNode.sourceEdge.source
    if (!fooNode || !fooNode.sourceEdge) {
      expect.fail('should not fail')
      return
    }
    expect(fooNode.sourceEdge.name).to.eq('foo')
  })
})
