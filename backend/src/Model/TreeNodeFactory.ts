import { Edge, Message, Tree, TreeNode } from './'

export abstract class TreeNodeFactory {
  public static fromEdgesAndValue(edgeNames: Array<string>, value: any): TreeNode {
    let currentNode: TreeNode = new Tree()
    for (const edgeName of edgeNames) {
      const edge = new Edge(edgeName)
      let newNode = new TreeNode(edge)
      edge.target = newNode
      currentNode.addEdge(edge)
      currentNode = newNode
    }

    currentNode.setMessage({ value: value })
    return currentNode
  }
}
