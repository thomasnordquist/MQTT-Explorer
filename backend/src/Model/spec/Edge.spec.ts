import 'mocha'

import { Edge, TreeNode, TreeNodeFactory } from '../'

import { expect } from 'chai'

describe('Edge', () => {
  it('should contain a name', () => {
    const e = new Edge('foo')
    expect(e.name).to.equal('foo')
  })

  it('firstEdge should retireve the first edge', () => {
    const topics = 'foo/bar/baz'.split('/')
    const leaf = TreeNodeFactory.fromEdgesAndValue(topics, undefined)
    const bazEdge = leaf.sourceEdge

    if (!bazEdge) {
      expect.fail('should not be undefined')
      return
    }

    expect(bazEdge.name).to.eq('baz')
    expect(bazEdge.firstEdge().name).to.eq('foo')
  })

  it('hash should not be empty', () => {
    const e = new Edge('bar')
    expect(e.hash().length).to.be.gt(0)
  })

  it('hash should be stable', () => {
    const e = new Edge('bar')
    const previousHash = e.hash()
    expect(e.hash()).to.eq(previousHash)
  })

  it('hash should include change if parents are different', () => {
    const topics1 = 'foo/bar/baz'.split('/')
    const bazEdge1 = TreeNodeFactory.fromEdgesAndValue(topics1, undefined).sourceEdge

    const topics2 = 'foo/foo/baz'.split('/')
    const bazEdge2 = TreeNodeFactory.fromEdgesAndValue(topics2, undefined).sourceEdge

    if (!bazEdge1 || !bazEdge2) {
      throw Error('should not happen')
    }

    expect(bazEdge1.hash()).to.not.eq(bazEdge2.hash())
  })
})
