import { Edge, Tree, TreeNode } from './'

export abstract class TreeNodeFactory {
  public static fromEdgesAndValue(edgeNames: Array<string>, value: any): TreeNode {
    const lastEdgeIndex = edgeNames.length - 1
    var edges = edgeNames
      .map((name, idx) => {
          const edge = new Edge(name)

          const nodeValue = lastEdgeIndex == idx ? value : undefined
          const node = new TreeNode(edge, nodeValue)
          edge.node = node
          return edge
      })

    let reversed: Array<Edge> = edges.reverse()
    let previous: Edge | undefined = undefined;
    for (let edge of reversed) {
        if (previous) {
            edge.node.addEdge(previous)
        }
        previous = edge;
    }

    let leaf = reversed[0].node

    let sourceTree = new Tree()
    sourceTree.updateWithNode(leaf.firstNode())

    return leaf
  }
}
