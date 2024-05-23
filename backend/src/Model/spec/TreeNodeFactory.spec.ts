import 'mocha'
import { expect } from 'chai'
import { makeTreeNode } from './makeTreeNode'

describe('TreeNodeFactory', () => {
  it('root node must not have a sourceEdge', () => {
    const leaf = makeTreeNode('foo/bar')

    expect(leaf.firstNode().sourceEdge).to.eq(undefined)
  })

  it('should create node', () => {
    const node = makeTreeNode('foo/bar', '5')

    if (!node.sourceEdge || !node.sourceEdge.source || !node.message) {
      expect.fail('should not happen')
      return
    }

    expect(node).to.not.eq(undefined)
    expect(node.sourceEdge.name).to.eq('bar')
    expect(node.message.payload!.toUnicodeString()).to.eq('5')

    const foo = node.firstNode().findNode('foo')
    expect(foo && foo.sourceEdge && foo.sourceEdge.name).to.eq('foo')
  })

  it('node should contain edges in order', () => {
    const node = makeTreeNode('foo/bar/baz', '5')

    if (!node.sourceEdge || !node.sourceEdge.source || !node.message) {
      expect.fail('should not happen')
      return
    }

    expect(node.message.payload!.toUnicodeString()).to.eq('5')
    expect(node.sourceEdge.name).to.eq('baz')

    const barNode = node.sourceEdge.source
    if (!barNode || !barNode.sourceEdge) {
      expect.fail('should not fail')
      return
    }
    expect(barNode.sourceEdge.name).to.eq('bar')

    const fooNode = barNode.sourceEdge.source
    if (!fooNode || !fooNode.sourceEdge) {
      expect.fail('should not fail')
      return
    }
    expect(fooNode.sourceEdge.name).to.eq('foo')
  })
})
