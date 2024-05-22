import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../backend/src/Model/Decoder'
import { get } from 'sparkplug-payload'
import { MessageDecoder } from './MessageDecoder'
var sparkplug = get('spBv1.0')

export const SparkplugDecoder: MessageDecoder = {
  formats: ['Sparkplug'],
  canDecodeTopic(topic: string) {
    return !!topic.match(/^spBv1\.0\/[^/]+\/[ND](DATA|CMD|DEATH|BIRTH)\/[^/]+(\/[^/]+)?$/u)
  },
  decode(input: Base64Message): Base64Message {
    try {
      const message = Base64Message.fromString(
        JSON.stringify(
          // @ts-ignore
          sparkplug.decodePayload(new Uint8Array(input.toBuffer()))
        )
      )
      message.decoder = Decoder.SPARKPLUG
      return message
    } catch {
      const message = new Base64Message(undefined, 'Failed to decode sparkplugb payload')
      message.decoder = Decoder.NONE
      return message
    }
  },
}
