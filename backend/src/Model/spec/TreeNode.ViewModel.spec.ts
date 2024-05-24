import 'mocha'

import { expect } from 'chai'
import { makeTreeNode } from './makeTreeNode'

describe('TreeNode', () => {
  const leaf1 = makeTreeNode('foo/bar', 'foo')
  const leaf2 = makeTreeNode('foo/bar/baz', 'bar')
  const leaf3 = makeTreeNode('foo/biz/baz', 'bar')
  const leaf4 = makeTreeNode('bar/biz', 'bar')
  const root = leaf1.firstNode()

  root.updateWithNode(leaf2.firstNode())
  root.updateWithNode(leaf3.firstNode())
  root.updateWithNode(leaf4.firstNode())

  describe('expanding the root should count the children', () => {
    it('nothing expanded', () => {
      expect(root?.viewModel?.visibleChildren()).to.eq(1)
    })

    it('root expanded', () => {
      root.viewModel?.setExpanded(true)
      expect(root?.viewModel?.visibleChildren()).to.eq(3)
    })

    it('root and "foo" expanded', () => {
      root.viewModel?.setExpanded(true)
      root.findNode('foo')!.viewModel!.setExpanded(true)
      expect(root?.viewModel?.visibleChildren()).to.eq(5)
    })
  })

  describe('visibleChildAt', () => {
    it('nothing expanded', () => {
      expect(root?.viewModel?.visibleChildAt(0)?.[0].path()).to.eq('')
    })

    it('root expanded', () => {
      root.viewModel?.setExpanded(true)
      expect(root?.viewModel?.visibleChildAt(1)?.[0].path()).to.eq('foo')
    })

    it('root and "foo" expanded', () => {
      root.viewModel?.setExpanded(true)
      root.findNode('foo')!.viewModel!.setExpanded(true)
      expect(root?.viewModel?.visibleChildAt(4)?.[0].path()).to.eq('bar')
    })
  })

  describe('getIndex', () => {
    it('nothing expanded', () => {
      expect(root?.viewModel?.getIndex()).to.eq(0)
    })

    it('root expanded', () => {
      root.viewModel?.setExpanded(true)
      expect(root?.viewModel?.visibleChildAt(1)?.[0].viewModel?.getIndex()).to.eq(1)
    })

    it('root and "foo" expanded', () => {
      root.viewModel?.setExpanded(true)
      root.findNode('foo')!.viewModel!.setExpanded(true)
      expect(root?.viewModel?.visibleChildAt(4)?.[0].viewModel?.getIndex()).to.eq(4)
    })
  })
})
