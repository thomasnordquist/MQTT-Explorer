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
      let message = Base64Message.fromString(
        JSON.stringify(SparkplugPayload.toObject(SparkplugPayload.decode(new Uint8Array(input))))
      )
      message.decoder = Decoder.SPARKPLUG
      return message
    } catch {
      // ignore
    }
  },
}

export const SparkplugEncoder = {
  encode(input: string): Buffer | undefined {
    try {
      console.log(input)
      const payload = JSON.parse(input)
      return Buffer.from(
        SparkplugPayload.encode(
          SparkplugPayload.create({
            timestamp: Date.now(),
            ...payload,
          })
        ).finish()
      )
    } catch (err) {
      // todo ?
    }
  },
}
