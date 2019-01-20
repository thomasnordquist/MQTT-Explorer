import { Edge, TreeNode } from './'
import { EventBusInterface, makeConnectionMessageEvent, MqttMessage } from '../../../events'
import { TreeNodeFactory } from './TreeNodeFactory'

export class Tree extends TreeNode {
  private connectionId?: string
  private updateSource?: EventBusInterface
  constructor() {
    super(undefined, undefined)
  }

  public updateWithConnection(emitter: EventBusInterface, connectionId: string) {
    this.updateSource = emitter
    this.updateSource.subscribe(makeConnectionMessageEvent(connectionId), this.handleNewData)
  }

  private handleNewData = (msg: MqttMessage) => {
    const edges = msg.topic.split('/')
    const node = TreeNodeFactory.fromEdgesAndValue(edges, msg.payload)
    node.mqttMessage = msg
    this.updateWithNode(node.firstNode())
  }

  public stopUpdating() {
    if (this.updateSource && this.connectionId) {
      this.updateSource.unsubscribeAll(makeConnectionMessageEvent(this.connectionId))
    }
  }
}
