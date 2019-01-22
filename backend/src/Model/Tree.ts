import { TreeNode } from './'
import { EventBusInterface, makeConnectionMessageEvent, MqttMessage } from '../../../events'
import { TreeNodeFactory } from './TreeNodeFactory'

export class Tree extends TreeNode {
  public connectionId?: string
  public updateSource?: EventBusInterface
  public nodeFilter?: (node: TreeNode) => boolean
  private subscriptionEvent?: any
  public isTree = true
  private cachedHash = `${Math.random()}`

  constructor() {
    super(undefined, undefined)
  }

  public updateWithConnection(emitter: EventBusInterface, connectionId: string, nodeFilter?:(node: TreeNode) => boolean) {
    this.updateSource = emitter
    this.connectionId = connectionId
    this.nodeFilter = nodeFilter

    this.subscriptionEvent = makeConnectionMessageEvent(connectionId)
    this.updateSource.subscribe(this.subscriptionEvent, this.handleNewData)
  }

  public hash() {
    return this.cachedHash
  }

  private handleNewData = (msg: MqttMessage) => {
    const edges = msg.topic.split('/')
    const node = TreeNodeFactory.fromEdgesAndValue(edges, msg.payload)
    node.mqttMessage = msg

    if (this.nodeFilter && !this.nodeFilter(node)) {
      return
    }
    this.updateWithNode(node.firstNode())
  }

  public stopUpdating() {
    if (this.subscriptionEvent && this.updateSource) {
      this.updateSource.unsubscribe(this.subscriptionEvent, this.handleNewData)
    }
  }
}
