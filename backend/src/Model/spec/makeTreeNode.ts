import { MqttMessage } from 'MQTT-Explorer/events/events'
import { TreeNodeFactory } from '..'
import { Base64Message } from '../Base64Message'
import { TreeNode } from '../TreeNode'

export function makeTreeNode(topic: string, message?: string): TreeNode<any> {
  const mqttMessage: MqttMessage = {
    topic,
    payload: message ? Base64Message.fromString(message) : null,
    qos: 0,
    retain: false,
    messageId: undefined,
  }

  return TreeNodeFactory.fromMessage(mqttMessage)
}
