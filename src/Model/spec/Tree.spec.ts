import { Edge, Tree, TreeNode, TreeNodeFactory } from '../'
import { expect } from 'chai';
import 'mocha';

import './TreeNode.findNode'

describe('Tree', () => {
  it('node can be merged into a tree', () => {
    const tree = new Tree()

    const topics = 'foo/bar'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, 3)
    debugger
    tree.updateWithNode(leaf.firstNode())
    let expectedNode = tree.findNode('foo/bar')
    expect(expectedNode).to.eq(leaf)
  })
});
