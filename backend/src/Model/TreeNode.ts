import { Edge, Message, RingBuffer } from './'
import { EventDispatcher, MqttMessage } from '../../../events'

export class TreeNode {
  public sourceEdge?: Edge
  public message?: Message
  public mqttMessage?: MqttMessage
  public messageHistory: RingBuffer<Message> = new RingBuffer<Message>(3000, 100)
  public edges: {[s: string]: Edge} = {}
  public edgeArray: Edge[] = []
  public collapsed = false
  public messages: number = 0
  public lastUpdate: number = Date.now()
  public onMerge = new EventDispatcher<void, TreeNode>(this)
  public onEdgesChange = new EventDispatcher<void, TreeNode>(this)
  public onMessage = new EventDispatcher<Message, TreeNode>(this)
  public isTree = false

  private cachedPath?: string
  private cachedChildTopics?: TreeNode[]
  private cachedLeafMessageCount?: number
  private cachedChildTopicCount?: number

  public unconnectedClone() {
    const node = new TreeNode()
    node.message = this.message
    node.mqttMessage = this.mqttMessage
    node.messageHistory = this.messageHistory.clone()
    node.messages = this.messages
    node.lastUpdate = this.lastUpdate

    return node
  }

  constructor(sourceEdge?: Edge, message?: Message) {
    if (sourceEdge) {
      this.sourceEdge = sourceEdge
      sourceEdge.target = this
    }

    message && this.setMessage(message)
    this.onMerge.subscribe(() => {
      this.cachedChildTopics = undefined
      this.cachedChildTopicCount = undefined
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
    if (!this.cachedPath) {
      return this.branch()
        .map(node => (node.sourceEdge && node.sourceEdge.name))
        .filter(name => name !== undefined)
        .join('/')
    }

    return this.cachedPath
  }

  private previous(): TreeNode | undefined {
    return this.sourceEdge ? this.sourceEdge.source || undefined : undefined
  }

  public addEdge(edge: Edge, emitUpdate: boolean = false) {
    this.edges[edge.name] = edge
    this.edgeArray.push(edge)
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
      this.mqttMessage = node.mqttMessage
    }

    this.mergeEdges(node)
    this.onMerge.dispatch()
  }

  public leafMessageCount(): number {
    if (this.cachedLeafMessageCount === undefined) {
      this.cachedLeafMessageCount = this.edgeArray
        .map(edge => edge.target.leafMessageCount())
        .reduce((a, b) => a + b, 0) + this.messages
    }

    return this.cachedLeafMessageCount
  }

  public childTopicCount(): number {
    if (this.cachedChildTopicCount === undefined) {
      this.cachedChildTopicCount = this.edgeArray
        .map(e => e.target.childTopicCount())
        .reduce((a, b) => a + b, this.edgeArray.length === 0 ? 1 : 0)
    }

    return this.cachedChildTopicCount
  }

  public edgeCount(): number {
    return this.edgeArray.length
  }

  public childTopics(): TreeNode[] {
    if (this.cachedChildTopics === undefined) {
      const initialValue = this.message && this.message.value ? [this] : []

      this.cachedChildTopics = this.edgeArray
        .map(e => e.target.childTopics())
        .reduce((a, b) => a.concat(b), initialValue)
    }

    return this.cachedChildTopics
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
