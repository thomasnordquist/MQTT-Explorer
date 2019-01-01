import { TreeNode, TreeNodeFactory } from '../'
import { expect } from 'chai';
import 'mocha';

import './TreeNode.findNode'

describe('TreeNode.findNode', () => {
  it('findNode should retrieve node', () => {
    const topics = 'foo/bar/baz'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, 5)

    let root = leaf.firstNode()
    expect(root.sourceEdge.name).to.eq('')

    let barNode = root.findNode('foo/bar')
    if (!barNode) {
      expect.fail('did not find node')
      return
    }
    expect(barNode.sourceEdge.name).to.eq('bar')

    let bazNode = root.findNode('foo/bar/baz')
    if (!bazNode) {
      expect.fail('did not find node')
      return
    }
    expect(bazNode.sourceEdge.name).to.eq('baz')
  })
})
