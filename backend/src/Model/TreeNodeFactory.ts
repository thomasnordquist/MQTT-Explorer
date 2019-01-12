import { Edge, Tree, TreeNode } from './'

interface HasLength {
  length: number
}

export abstract class TreeNodeFactory {
  public static fromEdgesAndValue<T extends HasLength>(edgeNames: string[], value: T): TreeNode {
    let currentNode: TreeNode = new Tree()
    for (const edgeName of edgeNames) {
      const edge = new Edge(edgeName)
      const newNode = new TreeNode(edge)
      edge.target = newNode
      currentNode.addEdge(edge)
      currentNode = newNode
    }

    currentNode.setMessage({
      value,
      length: value.length,
      received: new Date(),
    })
    return currentNode
  }
}
