import { TreeNode } from './'
import { EventBusInterface, makeConnectionMessageEvent, MqttMessage, EventDispatcher } from '../../../events'
import { TreeNodeFactory } from './TreeNodeFactory'

export class Tree<ViewModel> extends TreeNode<ViewModel> {
  public connectionId?: string
  public updateSource?: EventBusInterface
  public nodeFilter?: (node: TreeNode<ViewModel>) => boolean
  private subscriptionEvent?: any
  public isTree = true
  private cachedHash = `${Math.random()}`
  private unmergedMessages: MqttMessage[] = []
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
    this.unmergedMessages.forEach((msg) => {
      const edges = msg.topic.split('/')
      const node = TreeNodeFactory.fromEdgesAndValue<ViewModel, any>(edges, msg.payload)
      node.mqttMessage = msg

      if (!this.nodeFilter || this.nodeFilter(node)) {
        this.updateWithNode(node.firstNode())
      }
    })
    this.unmergedMessages = []
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
