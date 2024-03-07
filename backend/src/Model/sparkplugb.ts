import { readFileSync } from 'fs'
import * as protobuf from 'protobufjs'
import { Base64Message } from './Base64Message'
import { Decoder } from './Decoder'

const buffer = readFileSync(require.resolve('../../../../res/sparkplug_b.proto'))
const root = protobuf.parse(buffer.toString()).root
export let SparkplugPayload = root.lookupType('com.cirruslink.sparkplug.protobuf.Payload')

export const SparkplugDecoder = {
  decode(input: Buffer): Base64Message | undefined {
    try {
      const message = Base64Message.fromString(
        JSON.stringify(SparkplugPayload.toObject(SparkplugPayload.decode(new Uint8Array(input))))
      )
      message.decoder = Decoder.SPARKPLUG
      return message
    } catch {
      // ignore
    }
  },
}
