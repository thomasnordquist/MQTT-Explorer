import 'mocha'
import { expect } from 'chai'
import { Edge } from '../'
import { makeTreeNode } from './makeTreeNode'

describe('Edge', () => {
  it('should contain a name', () => {
    const e = new Edge('foo')
    expect(e.name).to.equal('foo')
  })

  it('firstEdge should retrieve the first edge', () => {
    const leaf = makeTreeNode('foo/bar/baz')
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
    const bazEdge1 = makeTreeNode('foo/bar/baz').sourceEdge
    const bazEdge2 = makeTreeNode('foo/foo/baz').sourceEdge

    if (!bazEdge1 || !bazEdge2) {
      throw Error('should not happen')
    }

    expect(bazEdge1.hash()).to.not.eq(bazEdge2.hash())
  })
})
