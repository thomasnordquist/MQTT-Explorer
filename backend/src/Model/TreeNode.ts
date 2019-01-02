import { Edge, Message } from './'
import { EventEmitter } from 'events'

export class TreeNode extends EventEmitter {
  public sourceEdge?: Edge
  public message?: Message
  public edges: {[s: string]: Edge} = {}
  public collapsed = false
  public messages: number = 0

  constructor(sourceEdge?: Edge, message?: Message) {
    super()

    if (sourceEdge) {
      this.sourceEdge = sourceEdge
      sourceEdge.target = this
    }

    this.setMessage(message)
  }

  public setMessage(value: any) {
    this.message = value
    this.messages += 1
  }

  public hash(): string {
    return 'N' + (this.sourceEdge ? this.sourceEdge.hash() : '')
  }

  public firstNode(): TreeNode {
    return this.sourceEdge && this.sourceEdge.source ? this.sourceEdge.source.firstNode() : this
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
    if (node.message) {
      this.setMessage(node.message)
    }

    this.mergeEdges(node)
    this.emit('update')
  }

  public leafes(): Array<TreeNode> {
    if (Object.values(this.edges).length === 0) {
      return [this]
    }

    return Object.values(this.edges)
      .map(e => e.target.leafes())
      .reduce((a, b) => a.concat(b), [])
  }

  private mergeEdges(node: TreeNode) {
    let edgeKeys = Object.keys(node.edges)
    for (let edgeKey of edgeKeys) {
      let matchingEdge = this.edges[edgeKey]
      if (matchingEdge) {
        matchingEdge.target.updateWithNode(node.edges[edgeKey].target)
      } else {
        this.addEdge(node.edges[edgeKey])
      }
    }
  }
}
