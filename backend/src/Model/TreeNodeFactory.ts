import { Destroyable, MemoryLifecycle } from './Destroyable'
import { Edge, Tree, TreeNode } from './'
import { MqttMessage } from '../../../events'
import { Base64Message } from './Base64Message'

export abstract class TreeNodeFactory {
  private static messageCounter = 0
  public static insertNodeAtPosition<ViewModel extends Destroyable & MemoryLifecycle>(
    edgeNames: Array<string>,
    node: TreeNode<ViewModel>
  ) {
    let currentNode: TreeNode<ViewModel> = new Tree()
    let edge
    for (const edgeName of edgeNames) {
      edge = new Edge<ViewModel>(edgeName)
      currentNode.addEdge(edge)
      currentNode = new TreeNode(edge)
      edge.target = currentNode
    }
    node.sourceEdge = edge
    node.sourceEdge!.target = node
  }

  public static fromMessage<ViewModel extends Destroyable & MemoryLifecycle>(
    mqttMessage: MqttMessage,
    receiveDate: Date = new Date()
  ): TreeNode<ViewModel> {
    const node = new TreeNode<ViewModel>()
    const edges = mqttMessage.topic.split('/')

    mqttMessage.retain
    node.setMessage({
      ...mqttMessage,
      payload: mqttMessage.payload && new Base64Message(mqttMessage.payload?.base64Message),
      length: mqttMessage.payload?.base64Message.length ?? 0,
      received: receiveDate,
      messageNumber: this.messageCounter,
    })
    this.messageCounter += 1

    this.insertNodeAtPosition<ViewModel>(edges, node)

    return node
  }
}
