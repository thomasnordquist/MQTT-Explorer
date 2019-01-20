import { Edge, Message, RingBuffer } from './'
import { EventDispatcher, MqttMessage } from '../../../events'

export class TreeNode {
  public sourceEdge?: Edge
  public message?: Message
  public mqttMessage?: MqttMessage
  public messageHistory: RingBuffer<Message> = new RingBuffer<Message>(3000, 100)
  public edges: {[s: string]: Edge} = {}
  public collapsed = false
  public messages: number = 0
  public lastUpdate: number = Date.now()
  public onMerge = new EventDispatcher<void, TreeNode>(this)
  public onEdgesChange = new EventDispatcher<void, TreeNode>(this)
  public onMessage = new EventDispatcher<Message, TreeNode>(this)
  private cachedLeafes?: TreeNode[]
  private cachedLeafMessageCount?: number

  constructor(sourceEdge?: Edge, message?: Message) {
    if (sourceEdge) {
      this.sourceEdge = sourceEdge
      sourceEdge.target = this
    }

    message && this.setMessage(message)
    this.onMerge.subscribe(() => {
      this.cachedLeafes = undefined
      this.cachedLeafMessageCount = undefined
      this.lastUpdate = Date.now()
    })
    this.onEdgesChange.subscribe(() => {
      this.lastUpdate = Date.now()
    })
    this.onMessage.subscribe(() => {
      this.lastUpdate = Date.now()
    })
  }

  public setMessage(message: Message) {
    this.messageHistory.add(message)
    this.message = message
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
      this.onEdgesChange.dispatch()
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
      this.onMessage.dispatch(node.message)
    }

    this.mergeEdges(node)
    this.onMerge.dispatch()
  }

  public leafMessageCount() {
    if (this.cachedLeafMessageCount === undefined) {
      this.cachedLeafMessageCount = this.leafes()
        .map(leaf => leaf.messages)
        .reduce((a, b) => a + b)
    }

    return this.cachedLeafMessageCount
  }

  public leafCount(): number {
    return this.leafes().length
  }

  public edgeCount(): number {
    return Object.values(this.edges).length
  }

  public leafes(): TreeNode[] {
    if (this.cachedLeafes === undefined) {
      if (Object.values(this.edges).length === 0) {
        return [this]
      }

      this.cachedLeafes = Object.values(this.edges)
        .map(e => e.target.leafes())
        .reduce((a, b) => a.concat(b), [])
    }

    return this.cachedLeafes
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
      this.onEdgesChange.dispatch()
    }
  }
}
