// cSpell:words protobuf
import * as protobuf from 'protobufjs'
import protocol from './sparkplugb.proto'
import { Base64Message } from './Base64Message'
import { Decoder } from './Decoder'

const root = protobuf.parse(protocol).root
/* cspell:disable-next-line */
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
    return undefined
  },
}
