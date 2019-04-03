import { TreeNode } from './'
import { EventBusInterface, makeConnectionMessageEvent, MqttMessage, EventDispatcher } from '../../../events'
import { TreeNodeFactory } from './TreeNodeFactory'

class ChangeBuffer {
  private buffer: MqttMessage[] = []
  private size = 0
  private maxSize = 100_000_000 // ~100MB
  public length = 0
  public estimatedMessageOverhead = 24

  public push(val: MqttMessage) {
    if (!this.isFull()) {
      this.buffer.push(val)
      this.size += this.estimatedMessageOverhead + (val.payload ? val.payload.length : 0)
      this.length += 1
    }
  }

  public getSize() {
    return this.size
  }

  public isFull() {
    return this.size >= this.maxSize
  }

  public fillState() {
    return this.size / this.maxSize
  }

  public popAll(): MqttMessage[] {
    const tmpBuffer = this.buffer
    this.buffer = []
    this.size = 0
    this.length = 0

    return tmpBuffer
  }
}

export class Tree<ViewModel> extends TreeNode<ViewModel> {
  public connectionId?: string
  public updateSource?: EventBusInterface
  public nodeFilter?: (node: TreeNode<ViewModel>) => boolean
  private subscriptionEvent?: any
  public isTree = true
  private cachedHash = `${Math.random()}`
  private unmergedMessages: ChangeBuffer = new ChangeBuffer()
  public didReceive = new EventDispatcher<void, Tree<ViewModel>>(this)

  constructor() {
    super(undefined, undefined)
  }

  public updateWithConnection(emitter: EventBusInterface, connectionId: string, nodeFilter?:(node: TreeNode<ViewModel>) => boolean) {
    this.updateSource = emitter
    this.connectionId = connectionId
    this.nodeFilter = nodeFilter

    this.subscriptionEvent = makeConnectionMessageEvent(connectionId)
    this.updateSource.subscribe(this.subscriptionEvent, this.handleNewData)
  }

  public hash() {
    return this.cachedHash
  }

  public applyUnmergedChanges() {
    this.unmergedMessages.popAll().forEach((msg) => {
      const edges = msg.topic.split('/')
      const node = TreeNodeFactory.fromEdgesAndValue<ViewModel>(edges, msg.payload)
      node.mqttMessage = msg

      if (!this.nodeFilter || this.nodeFilter(node)) {
        this.updateWithNode(node.firstNode())
      }
    })
  }

  public unmergedChanges(): ChangeBuffer {
    return this.unmergedMessages
  }

  private handleNewData = (msg: MqttMessage) => {
    this.unmergedMessages.push(msg)
    this.didReceive.dispatch()
  }

  public stopUpdating() {
    if (this.subscriptionEvent && this.updateSource) {
      this.updateSource.unsubscribe(this.subscriptionEvent, this.handleNewData)
    }
  }
}
