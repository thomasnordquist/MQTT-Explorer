import { Edge } from './'

export class TreeNode {
  public sourceEdge: Edge
  public value: any | null | undefined = undefined
  public edges: {[s: string]: Edge} = {}

  constructor(sourceEdge: Edge, value: any) {
    this.sourceEdge = sourceEdge
    sourceEdge.target = this
    this.value = value
  }

  public firstNode(): TreeNode {
    return this.sourceEdge.firstEdge().node
  }

  private previous(): TreeNode | undefined {
    return this.sourceEdge.source || undefined
  }

  public addEdge(edge: Edge) {
    this.edges[edge.name] = edge
    edge.source = this
  }

  public branch(): Array<TreeNode> {
    let previous = this.previous()
    if (!previous) {
      return [this]
    }

    return previous.branch().concat([this])
  }

  public updateWithNode(node: TreeNode) {
    debugger
    if (node.value !== undefined) {
      this.value = node.value
    }
    this.mergeEdges(node)
  }

  public leaves(): Array<TreeNode> {
    if (Object.values(this.edges).length === 0) {
      return [this]
    }

    return Object.values(this.edges)
      .map(e => e.node.leaves())
      .reduce((a, b) => a.concat(b), [])
  }

  private mergeEdges(node: TreeNode) {
    let edgeKeys = Object.keys(node.edges)
    for (let edgeKey of edgeKeys) {
      let matchingEdge = this.edges[edgeKey]
      if (matchingEdge) {
        matchingEdge.node.updateWithNode(node.edges[edgeKey].node)
      } else {
        this.addEdge(node.edges[edgeKey])
      }
    }
  }
}
