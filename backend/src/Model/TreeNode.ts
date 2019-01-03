import { Edge, Message } from './'
import { EventEmitter } from 'events'

export enum TreeNodeUpdateEvents {
  edges = 'edges',
  message = 'message',
  merge = 'merge',
}

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

  private propagateUpdate(event: TreeNodeUpdateEvents) {
    this.emit(event)
  }

  public setMessage(value: any) {
    this.message = value
    this.messages += 1
  }

  public hash(): string {
    return `N${(this.sourceEdge ? this.sourceEdge.hash() : '')}`
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

  public addEdge(edge: Edge, emitUpdate: boolean = false) {
    this.edges[edge.name] = edge
    edge.source = this

    if (emitUpdate) {
      this.propagateUpdate(TreeNodeUpdateEvents.edges)
    }
  }

  public branch(): TreeNode[] {
    const previous = this.previous()
    if (!previous) {
      return [this]
    }

    return previous.branch().concat([this])
  }

  public updateWithNode(node: TreeNode) {
    if (node.message) {
      this.setMessage(node.message)
      this.propagateUpdate(TreeNodeUpdateEvents.message)
    }

    this.mergeEdges(node)
    this.propagateUpdate(TreeNodeUpdateEvents.merge)
  }

  public leafes(): TreeNode[] {
    if (Object.values(this.edges).length === 0) {
      return [this]
    }

    return Object.values(this.edges)
      .map(e => e.target.leafes())
      .reduce((a, b) => a.concat(b), [])
  }

  private mergeEdges(node: TreeNode) {
    const edgeKeys = Object.keys(node.edges)
    let edgesDidUpdate = false

    for (const edgeKey of edgeKeys) {
      const matchingEdge = this.edges[edgeKey]
      if (matchingEdge) {
        matchingEdge.target.updateWithNode(node.edges[edgeKey].target)
      } else {
        this.addEdge(node.edges[edgeKey], false)
        edgesDidUpdate = true
      }
    }

    if (edgesDidUpdate) {
      this.propagateUpdate(TreeNodeUpdateEvents.edges)
    }
  }
}
