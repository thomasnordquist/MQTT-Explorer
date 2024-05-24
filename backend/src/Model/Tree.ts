import { ChangeBuffer } from './ChangeBuffer'
import { Destroyable, MemoryLifecycle } from './Destroyable'
import { EventDispatcher, makeConnectionMessageEvent, MqttMessage, EventBusInterface } from '../../../events'
import { TreeNode } from './'
import { TreeNodeFactory } from './TreeNodeFactory'

export class Tree<ViewModel extends Destroyable & MemoryLifecycle> extends TreeNode<ViewModel> {
  public connectionId?: string
  public updateSource?: EventBusInterface
  public nodeFilter?: (node: TreeNode<ViewModel>) => boolean
  private subscriptionEvent?: any
  public isTree = true
  private cachedHash = `${Math.random()}`
  private unmergedMessages: ChangeBuffer = new ChangeBuffer()
  public didUpdate = new EventDispatcher<void>()

  public updateInterval: any
  private paused: boolean = false
  private applyChangesHasCompleted = true

  constructor() {
    super(undefined, undefined)
  }

  private handleNewData = (msg: MqttMessage) => {
    this.unmergedMessages.push(msg)
  }

  private runUpdates() {
    this.updateInterval = setInterval(() => {
      if (!this.paused && this.applyChangesHasCompleted) {
        this.applyChangesHasCompleted = false
        if ((window as any).requestIdleCallback) {
          ;(window as any).requestIdleCallback(() => this.applyUnmergedChanges(), { timeout: 500 })
        } else {
          this.applyUnmergedChanges()
        }
      }
    }, 300)
  }

  public destroy() {
    super.destroy()
    this.updateInterval && clearInterval(this.updateInterval)
    this.updateSource && this.updateSource.unsubscribe(this.subscriptionEvent, this.handleNewData)
    this.updateSource = undefined
    this.didUpdate.removeAllListeners()
  }

  public updateWithConnection(
    emitter: EventBusInterface,
    connectionId: string,
    nodeFilter?: (node: TreeNode<ViewModel>) => boolean
  ) {
    this.updateSource = emitter
    this.connectionId = connectionId
    this.nodeFilter = nodeFilter

    this.subscriptionEvent = makeConnectionMessageEvent(connectionId)
    this.updateSource.subscribe(this.subscriptionEvent, this.handleNewData)
    this.runUpdates()
  }

  public hash() {
    return this.cachedHash
  }

  public pause() {
    this.paused = true
  }

  public resume() {
    this.paused = false
  }

  public applyUnmergedChanges() {
    this.unmergedMessages.popAll().forEach(bufferedItem => {
      const node = TreeNodeFactory.fromMessage<ViewModel>(bufferedItem.message, bufferedItem.received)

      if (!this.nodeFilter || this.nodeFilter(node)) {
        this.updateWithNode(node.firstNode())
      }
    })

    this.didUpdate.dispatch()
    this.applyChangesHasCompleted = true
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
