import { TreeNodeFactory } from '../'
import { Base64Message } from '../Base64Message'
import { TreeNode } from '../TreeNode'
import { MqttMessage } from '../../../../events'
import { SparkplugPayload } from '../sparkplugb'

interface Decoder {
  decode(input: string): string | null
}

const SparkplugDecoder = {
  decoderTime: 0,
  encoder: new TextEncoder(),
  decode(input: string): string | null {
    if (!SparkplugPayload) {
      return null
    }

    const start = performance.now()

    let result
    try {
      result = JSON.stringify(SparkplugPayload.toObject(SparkplugPayload.decode(this.encoder.encode(input))))
    } catch { }

    this.decoderTime += performance.now() - start;
    return result ?? null
  }
}

let i = 1
setInterval(() => {
  console.log(`decoder time after ${i++ * 10} seconds: ${SparkplugDecoder.decoderTime}ms`)
}, 10000)

export function makeTreeNode(topic: string, message?: string): TreeNode<any> {
  let sparkplugMessage = message && SparkplugDecoder.decode(message)
  const mqttMessage: MqttMessage = {
    topic,
    payload: message ? Base64Message.fromString(sparkplugMessage ?? message) : null,
    qos: 0,
    retain: false,
    messageId: undefined,
  }

  return TreeNodeFactory.fromMessage(mqttMessage)
}
