import { Edge } from './'
import { EventEmitter } from 'events'

export class TreeNode extends EventEmitter {
  public sourceEdge?: Edge
  public value?: any | null
  public edges: {[s: string]: Edge} = {}
  public collapsed = false

  constructor(sourceEdge?: Edge, value?: any) {
    super()

    if (sourceEdge) {
      this.sourceEdge = sourceEdge
      sourceEdge.node = this
    }
    this.value = value
  }

  public hash(): string {
    return 'N' + (this.sourceEdge ? this.sourceEdge.hash() : '')
  }

  public firstNode(): TreeNode {
    return this.sourceEdge ? this.sourceEdge.firstEdge().node : this
  }

  public path(): string {
    return this.branch()
      .map(node => (node.sourceEdge && node.sourceEdge.name))
      .filter(name => name !== undefined)
      .join('/')
  }

  private previous(): TreeNode | undefined {
    return this.sourceEdge ? this.sourceEdge.source || undefined : undefined
  }

  public addEdge(edge: Edge) {
    this.edges[edge.name] = edge
    edge.source = this
    this.emit('update')
  }

  public branch(): Array<TreeNode> {
    let previous = this.previous()
    if (!previous) {
      return [this]
    }

    return previous.branch().concat([this])
  }

  public updateWithNode(node: TreeNode) {
    if (node.value !== undefined) {
      this.value = node.value
    }
    this.mergeEdges(node)
    this.emit('update')
  }

  public leafes(): Array<TreeNode> {
    if (Object.values(this.edges).length === 0) {
      return [this]
    }

    return Object.values(this.edges)
      .map(e => e.node.leafes())
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
