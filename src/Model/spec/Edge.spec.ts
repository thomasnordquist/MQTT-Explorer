import { Edge, TreeNode } from '../'
import { expect } from 'chai';
import 'mocha';

describe('Edge', () => {

  it('should contain a name', () => {
      let e = new Edge('foo')
      expect(e.name).to.equal('foo')
  });

  it('hash should not be empty', () => {
      let e = new Edge('bar')
      expect(e.hash().length).to.be.gt(0)
  });

  it('hash should be stable', () => {
      let e = new Edge('bar')
      let previousHash = e.hash()
      expect(e.hash()).to.eq(previousHash)
  });

  it('hash should change when parent is present', () => {
      let foo = new Edge('foo')
      let bar = new Edge('bar')

      var previousHash = bar.hash()
      bar.source = new TreeNode(foo, undefined)
      expect(bar.hash()).to.not.eq(previousHash)
  });
});
