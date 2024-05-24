import { Destroyable, MemoryLifecycle } from './Destroyable'
import { Edge, Message, RingBuffer, MessageHistory } from './'
import { EventDispatcher } from '../../../events'
import { TopicViewModel } from '../../../app/src/model/TopicViewModel'

export type TopicDataType = 'string' | 'json' | 'hex'

export class TreeNode<ViewModel extends Destroyable & MemoryLifecycle> {
  public sourceEdge?: Edge<ViewModel>
  public message?: Message
  public messageHistory: MessageHistory = new RingBuffer<Message>(20000, 100)
  public viewModel?: ViewModel
  public edges: { [s: string]: Edge<ViewModel> } = {}
  public edgeArray: Array<Edge<ViewModel>> = []
  public collapsed = false
  public messages: number = 0
  public lastUpdate: number = Date.now()
  public onMerge = new EventDispatcher<void>()
  public onEdgesChange = new EventDispatcher<void>()
  public onMessage = new EventDispatcher<Message>()
  public onDestroy = new EventDispatcher<TreeNode<ViewModel>>()
  public isTree = false
  public type: TopicDataType = 'json'

  private cachedPath?: string
  private cachedChildTopics?: Array<TreeNode<ViewModel>>
  private cachedLeafMessageCount?: number
  private cachedChildTopicCount?: number

  constructor(sourceEdge?: Edge<ViewModel>, message?: Message) {
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
      this.cachedChildTopics = undefined
      this.cachedChildTopicCount = undefined
      this.cachedLeafMessageCount = undefined
      this.lastUpdate = Date.now()
    })
    this.onMessage.subscribe(() => {
      this.lastUpdate = Date.now()
    })
    this.viewModel = new TopicViewModel(this as any) as any
    this.viewModel?.retain()
  }

  private previous(): TreeNode<ViewModel> | undefined {
    return this.sourceEdge ? this.sourceEdge.source || undefined : undefined
  }

  private isTopicEmptyLeaf() {
    return !this.hasMessage() && this.isLeaf()
  }

  private isLeaf() {
    return this.edgeArray.length === 0
  }

  private removeFromParent() {
    const previous = this.previous()
    if (!previous || !this.sourceEdge) {
      return
    }
    this.lastUpdate = Date.now()
    previous.removeEdge(this.sourceEdge)
    if (!this.isTree) {
      this.destroy()
    }
  }

  private findChild(edges: Array<string>): TreeNode<ViewModel> | undefined {
    if (edges.length === 0) {
      return this
    }

    const nextEdge = this.edges[edges[0]]
    if (!nextEdge) {
      return undefined
    }

    return nextEdge.target.findChild(edges.slice(1))
  }

  private mergeEdges(node: TreeNode<ViewModel>) {
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

  public hasMessage() {
    return this.message && this.message.payload && this.message.length !== 0
  }

  public destroy() {
    this.onDestroy.dispatch(this)
    this.onDestroy.removeAllListeners()

    for (const edge of this.edgeArray) {
      edge.target.destroy()
    }
    this.viewModel?.release()
    this.viewModel = undefined
    this.edgeArray = []
    this.edges = {}
    this.cachedChildTopics = []
    this.sourceEdge = undefined
    this.onMerge.removeAllListeners()
    this.onEdgesChange.removeAllListeners()
    this.onMessage.removeAllListeners()
    this.messageHistory = new RingBuffer<Message>(1, 1)
    this.message = undefined
  }

  public unconnectedClone() {
    const node = new TreeNode<ViewModel>()
    node.message = this.message
    node.messageHistory = this.messageHistory.clone()
    node.messages = this.messages
    node.lastUpdate = this.lastUpdate

    return node
  }

  public setMessage(message: Message) {
    this.messageHistory.add(message)
    this.message = message
    this.messages += 1
  }

  public hash(): string {
    return `N${this.sourceEdge?.hash() ?? ''}`
  }

  public firstNode(): TreeNode<ViewModel> {
    return this.sourceEdge && this.sourceEdge.source ? this.sourceEdge.source.firstNode() : this
  }

  public path(): string {
    if (!this.cachedPath) {
      this.cachedPath = this.branch()
        .map(node => node.sourceEdge && node.sourceEdge.name)
        .filter(name => name !== undefined)
        .join('/')
    }

    return this.cachedPath
  }

  public addEdge(edge: Edge<ViewModel>, emitUpdate: boolean = false) {
    this.edges[edge.name] = edge
    this.edgeArray.push(edge)
    edge.source = this

    edge.target && edge.target.removeFromTreeIfEmpty()

    if (emitUpdate) {
      this.onEdgesChange.dispatch()
    }
  }

  public branch(): Array<TreeNode<ViewModel>> {
    const previous = this.previous()
    if (!previous) {
      return [this]
    }

    return previous.branch().concat([this])
  }

  public removeEdge(edge: Edge<any>) {
    delete this.edges[edge.name]
    this.edgeArray = Object.values(this.edges)

    this.removeFromTreeIfEmpty()
    this.onMerge.dispatch()
  }

  public removeFromTreeIfEmpty() {
    if (this.isTopicEmptyLeaf()) {
      this.removeFromParent()
    }
  }

  public updateWithNode(node: TreeNode<ViewModel>) {
    if (node.message) {
      this.setMessage(node.message)
      this.onMessage.dispatch(node.message)
    }

    this.removeFromTreeIfEmpty()
    this.mergeEdges(node)
    this.onMerge.dispatch()
  }

  public leafMessageCount(): number {
    if (this.cachedLeafMessageCount === undefined) {
      this.cachedLeafMessageCount =
        this.edgeArray.map(edge => edge.target.leafMessageCount()).reduce((a, b) => a + b, 0) + this.messages
    }

    return this.cachedLeafMessageCount as number
  }

  public childTopicCount(): number {
    if (this.cachedChildTopicCount === undefined) {
      this.cachedChildTopicCount = this.edgeArray
        .map(e => e.target.childTopicCount())
        .reduce((a, b) => a + b, this.hasMessage() ? 1 : 0)
    }

    return this.cachedChildTopicCount as number
  }

  public edgeCount(): number {
    return this.edgeArray.length
  }

  public childTopics(): Array<TreeNode<ViewModel>> {
    if (this.cachedChildTopics === undefined) {
      const initialValue = this.message && this.message.payload ? [this] : []

      this.cachedChildTopics = this.edgeArray
        .map(e => e.target.childTopics())
        .reduce((a, b) => a.concat(b), initialValue)
    }

    return this.cachedChildTopics as Array<TreeNode<ViewModel>>
  }

  public findNode(path: String): TreeNode<ViewModel> | undefined {
    const topics = path.split('/')

    return this.findChild(topics)
  }
}
