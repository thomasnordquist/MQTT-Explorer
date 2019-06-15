import 'mocha'

import { TreeNodeFactory } from '../'
import { expect } from 'chai'
import { Base64Message } from '../Base64Message'

describe('TreeNode', () => {
  const number3 = Base64Message.fromString('3')
  const number5 = Base64Message.fromString('5')
  it('firstNode should retrieve first node', () => {
    const topics = 'foo/bar'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, undefined)

    expect(leaf.firstNode().edges['foo']).to.not.eq(undefined)
  })

  it('updateWithNode should update value', () => {
    const topics = 'foo/bar'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, Base64Message.fromString('3'))
    expect(Base64Message.toUnicodeString(leaf.message!.value!)).to.eq('3')
    const updateLeave = TreeNodeFactory.fromEdgesAndValue(topics, Base64Message.fromString('5'))

    const root = leaf.firstNode()
    root.updateWithNode(updateLeave.firstNode())

    expect(root.sourceEdge).to.eq(undefined)
    expect(Base64Message.toUnicodeString(leaf.message!.value!)).to.eq('5')
  })

  it('updateWithNode should update intermediate nodes', () => {
    const topics1 = 'foo/bar/baz'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics1, Base64Message.fromString('3'))
    expect(Base64Message.toUnicodeString(leaf.message!.value!)).to.eq('3')

    const topics2 = 'foo/bar'.split('/')
    const updateLeave = TreeNodeFactory.fromEdgesAndValue(topics2, Base64Message.fromString('5'))
    leaf.firstNode().updateWithNode(updateLeave.firstNode())

    const barNode = leaf.firstNode().findNode('foo/bar')
    expect(barNode && barNode.sourceEdge && barNode.sourceEdge.name).to.eq('bar')
    expect(Base64Message.toUnicodeString(barNode!.message!.value!)).to.eq('5')

    expect(leaf.sourceEdge && leaf.sourceEdge.name).to.eq('baz')
    expect(Base64Message.toUnicodeString(leaf.message!.value!)).to.eq('3')
  })

  it('updateWithNode should add nodes to the tree', () => {
    const topics1 = 'foo/bar'.split('/')
    const leaf1 = TreeNodeFactory.fromEdgesAndValue(topics1, Base64Message.fromString('foo'))

    const topics2 = 'foo/bar/baz'.split('/')
    const leaf2 = TreeNodeFactory.fromEdgesAndValue(topics2, Base64Message.fromString('bar'))

    leaf1.firstNode().updateWithNode(leaf2.firstNode())

    const expectedNode = leaf1.firstNode().findNode('foo/bar/baz')
    if (!expectedNode) {
      expect.fail('merge seems to have failed')
      return
    }
  })
})
