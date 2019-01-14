import 'mocha'
import './TreeNode.findNode'

import { TreeNodeFactory } from '../'
import { expect } from 'chai'

describe('TreeNode.findNode', () => {
  it('findNode should retrieve node', () => {
    const topics = 'foo/bar/baz'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, undefined)

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
