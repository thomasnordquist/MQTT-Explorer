import 'mocha'

import { TreeNodeFactory } from '../'
import { expect } from 'chai'
import { makeTreeNode } from './makeTreeNode'

describe('TreeNode.findNode', () => {
  it('findNode should retrieve node', () => {
    const leaf = makeTreeNode('foo/bar/baz')

    const root = leaf.firstNode()
    expect(root.sourceEdge).to.eq(undefined)

    const barNode = root.findNode('foo/bar')
    if (!barNode) {
      expect.fail('did not find node')
      return
    }
    expect(barNode.sourceEdge && barNode.sourceEdge.name).to.eq('bar')

    const bazNode = root.findNode('foo/bar/baz')
    if (!bazNode) {
      expect.fail('did not find node')
      return
    }
    expect(bazNode.sourceEdge && bazNode.sourceEdge.name).to.eq('baz')
  })
})
