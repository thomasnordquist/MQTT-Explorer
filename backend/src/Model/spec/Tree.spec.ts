import 'mocha'
import { expect } from 'chai'
import { Tree } from '../'
import { makeTreeNode } from './makeTreeNode'

describe('Tree', () => {
  it('node can be merged into a tree', () => {
    const tree = new Tree()
    const leaf = makeTreeNode('foo/bar')

    tree.updateWithNode(leaf.firstNode())
    const expectedNode = tree.findNode('foo/bar')

    expect(expectedNode).to.eq(leaf)
  })
})
