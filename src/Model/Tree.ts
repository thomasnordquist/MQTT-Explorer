import { Edge, TreeNode } from './'

export class Tree extends TreeNode {
  constructor() {
    const rootEdge = new Edge('')
    super(rootEdge, undefined)
    rootEdge.node = this
  }
}
