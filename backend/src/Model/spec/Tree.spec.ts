import 'mocha'
import './TreeNode.findNode'

import { Tree, TreeNodeFactory } from '../'

import { expect } from 'chai'

describe('Tree', () => {
  it('node can be merged into a tree', () => {
    const tree = new Tree()

    const topics = 'foo/bar'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, undefined)

    tree.updateWithNode(leaf.firstNode())
    const expectedNode = tree.findNode('foo/bar')
    expect(expectedNode).to.eq(leaf)
  })
})
