import 'mocha'

import { expect } from 'chai'
import { makeTreeNode } from './makeTreeNode'

describe('TreeNode', () => {
  it('firstNode should retrieve first node', () => {
    const leaf = makeTreeNode('foo/bar')

    expect(leaf.firstNode().edges['foo']).to.not.eq(undefined)
  })

  it('updateWithNode should update value', () => {
    const topics = 'foo/bar'.split('/')
    const leaf = makeTreeNode('foo/bar', '3')
    expect(leaf.message!.payload!.toUnicodeString()).to.eq('3')

    const updateLeave = makeTreeNode('foo/bar', '5')

    const root = leaf.firstNode()
    root.updateWithNode(updateLeave.firstNode())

    expect(root.sourceEdge).to.eq(undefined)
    expect(leaf.message!.payload!.toUnicodeString()).to.eq('5')
  })

  it('updateWithNode should update intermediate nodes', () => {
    const topics1 = 'foo/bar/baz'.split('/')
    const leaf = makeTreeNode('foo/bar/baz', '3')
    expect(leaf.message!.payload!.toUnicodeString()).to.eq('3')

    const topics2 = 'foo/bar'.split('/')
    const updateLeave = makeTreeNode('foo/bar', '5')

    leaf.firstNode().updateWithNode(updateLeave.firstNode())

    const barNode = leaf.firstNode().findNode('foo/bar')
    expect(barNode && barNode.sourceEdge && barNode.sourceEdge.name).to.eq('bar')
    expect(barNode!.message!.payload!.toUnicodeString()).to.eq('5')

    expect(leaf.sourceEdge && leaf.sourceEdge.name).to.eq('baz')
    expect(leaf.message!.payload!.toUnicodeString()).to.eq('3')
  })

  it('updateWithNode should add nodes to the tree', () => {
    const leaf1 = makeTreeNode('foo/bar', 'foo')
    const leaf2 = makeTreeNode('foo/bar/baz', 'bar')

    leaf1.firstNode().updateWithNode(leaf2.firstNode())

    const expectedNode = leaf1.firstNode().findNode('foo/bar/baz')
    if (!expectedNode) {
      expect.fail('merge seems to have failed')
      return
    }
  })
})
