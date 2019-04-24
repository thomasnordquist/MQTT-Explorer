import { ChangeBuffer } from './ChangeBuffer'
import {
  EventBusInterface,
  EventDispatcher,
  makeConnectionMessageEvent,
  MqttMessage
} from '../../../events'
import { TreeNode } from './'
import { TreeNodeFactory } from './TreeNodeFactory'

export class Tree<ViewModel> extends TreeNode<ViewModel> {
  public connectionId?: string
  public updateSource?: EventBusInterface
  public nodeFilter?: (node: TreeNode<ViewModel>) => boolean
  private subscriptionEvent?: any
  public isTree = true
  private cachedHash = `${Math.random()}`
  private unmergedMessages: ChangeBuffer = new ChangeBuffer()
  public didReceive = new EventDispatcher<void, Tree<ViewModel>>()

  constructor() {
    super(undefined, undefined)
  }

  private handleNewData = (msg: MqttMessage) => {
    this.unmergedMessages.push(msg)
    this.didReceive.dispatch()
  }

  public destroy() {
    super.destroy()
    this.updateSource && this.updateSource.unsubscribe(this.subscriptionEvent, this.handleNewData)
    this.updateSource = undefined
    this.didReceive.removeAllListeners()
  }

  public updateWithConnection(emitter: EventBusInterface, connectionId: string, nodeFilter?: (node: TreeNode<ViewModel>) => boolean) {
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

  public stopUpdating() {
    if (this.subscriptionEvent && this.updateSource) {
      this.updateSource.unsubscribe(this.subscriptionEvent, this.handleNewData)
    }
  }
}
