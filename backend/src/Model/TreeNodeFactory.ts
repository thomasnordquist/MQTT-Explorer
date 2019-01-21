import { Edge, Tree, TreeNode } from './'

interface HasLength {
  length: number
}

export abstract class TreeNodeFactory {
  public static insertNodeAtPosition(edgeNames: string[], node: TreeNode) {
    let currentNode: TreeNode = new Tree()
    let edge
    for (const edgeName of edgeNames) {
      edge = new Edge(edgeName)
      currentNode.addEdge(edge)
      currentNode = new TreeNode(edge)
      edge.target = currentNode
    }
    node.sourceEdge = edge
    node.sourceEdge!.target = node
  }

  public static fromEdgesAndValue<T extends HasLength>(edgeNames: string[], value?: T): TreeNode {
    const node = new TreeNode()
    node.setMessage({
      value,
      length: value ? value.length : 0,
      received: new Date(),
    })

    this.insertNodeAtPosition(edgeNames, node)

    return node
  }
}
