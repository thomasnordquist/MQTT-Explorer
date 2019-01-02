import { TreeNodeFactory } from  '../'
import './TreeNode.findNode'
import { expect } from 'chai'
import 'mocha'

describe('TreeNode', () => {
  it('firstNode should retrieve first node', () => {
    const topics = 'foo/bar'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, 3)

    expect(leaf.firstNode().edges['foo']).to.not.eq(undefined)
  })

  it('updateWithNode should update value', () => {
    const topics = 'foo/bar'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, 3)
    expect(leaf.message && leaf.message.value).to.eq(3)
    const updateLeave = TreeNodeFactory.fromEdgesAndValue(topics, 5)

    const root = leaf.firstNode()
    root.updateWithNode(updateLeave.firstNode())

    expect(root.sourceEdge).to.eq(undefined)
    expect(leaf.message && leaf.message.value).to.eq(5)
  })

  it('updateWithNode should update intermediate nodes', () => {
    const topics1 = 'foo/bar/baz'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics1, 3)
    expect(leaf.message && leaf.message.value).to.eq(3)

    const topics2 = 'foo/bar'.split('/')
    const updateLeave = TreeNodeFactory.fromEdgesAndValue(topics2, 5)
    leaf.firstNode().updateWithNode(updateLeave.firstNode())

    const barNode = leaf.firstNode().findNode('foo/bar')
    expect(barNode && barNode.sourceEdge && barNode.sourceEdge.name).to.eq('bar')
    expect(barNode && barNode.message && barNode.message.value).to.eq(5)

    expect(leaf.sourceEdge && leaf.sourceEdge.name).to.eq('baz')
    expect(leaf.message && leaf.message.value).to.eq(3)
  })

  it('updateWithNode should add nodes to the tree', () => {
    const topics1 = 'foo/bar'.split('/')
    const leaf1 = TreeNodeFactory.fromEdgesAndValue(topics1, 3)

    const topics2 = 'foo/bar/baz'.split('/')
    const leaf2 = TreeNodeFactory.fromEdgesAndValue(topics2, 5)

    leaf1.firstNode().updateWithNode(leaf2.firstNode())

    const expectedNode = leaf1.firstNode().findNode('foo/bar/baz')
    if (!expectedNode) {
      expect.fail('merge seems to have failed')
      return
    }
  })
})
