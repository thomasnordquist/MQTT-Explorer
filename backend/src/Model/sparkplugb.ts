import { Base64Message } from './Base64Message'
import { Decoder } from './Decoder'
import { get } from 'sparkplug-payload'
var sparkplug = get("spBv1.0")

export const SparkplugDecoder = {
  decode(input: Buffer): Base64Message {
    try {
      const message = Base64Message.fromString(JSON.stringify(
        // @ts-ignore
        sparkplug.decodePayload(new Uint8Array(input)))
      )
      message.decoder = Decoder.SPARKPLUG
      return message
    } catch {
      const message = Base64Message.fromString("Failed to decode sparkplugb payload")
      message.decoder = Decoder.NONE
      return message
    }
  },
}

export const SparkplugEncoder = {
  encode(input: string): Buffer | undefined {
    try {
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
      console.error(err)
    }
  },
}
