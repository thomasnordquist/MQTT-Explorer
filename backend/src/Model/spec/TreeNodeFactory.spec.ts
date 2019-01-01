import { Edge, TreeNode, TreeNodeFactory } from '../'
import { expect } from 'chai';
import 'mocha';

describe('TreeNodeFactory', () => {
  it('should create node', () => {
    let topic = 'foo/bar'
    let edges = topic.split('/')
    let node = TreeNodeFactory.fromEdgesAndValue(edges, 5)

    expect(node).to.not.eq(undefined)
    expect(node.sourceEdge.name).to.eq('bar')
    expect(node.value).to.eq(5)

    if (!node.sourceEdge.source) {
      expect.fail('should not happen')
      return
    }

    let foo = node.sourceEdge.source.sourceEdge
    expect(foo.name).to.eq('foo')
  });

  it('node should contain edges in order', () => {
    let topic = 'foo/bar/baz'
    let edges = topic.split('/')
    let node = TreeNodeFactory.fromEdgesAndValue(edges, 5)

    expect(node.value).to.eq(5)
    expect(node.sourceEdge.name).to.eq('baz')

    const barNode = node.sourceEdge.source
    if (!barNode) {
      expect.fail('should not fail')
      return
    }
    expect(barNode.sourceEdge.name).to.eq('bar')

    const fooNode = barNode.sourceEdge.source
    if (!fooNode) {
      expect.fail('should not fail')
      return
    }
    expect(fooNode.sourceEdge.name).to.eq('foo')
  });
});
