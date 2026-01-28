import { get } from 'sparkplug-payload'
import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../backend/src/Model/Decoder'
import { MessageDecoder } from './MessageDecoder'

const sparkplug = get('spBv1.0')

export const SparkplugDecoder: MessageDecoder = {
  formats: ['Sparkplug'],
  canDecodeTopic(topic: string) {
    return !!topic.match(/^spBv1\.0\/[^/]+\/[ND](DATA|CMD|DEATH|BIRTH)\/[^/]+(\/[^/]+)?$/u)
  },
  decode(input) {
    try {
      const message = Base64Message.fromString(
        JSON.stringify(
          // @ts-ignore
          sparkplug.decodePayload(new Uint8Array(input.toBuffer()))
        )
      )
      return { message, decoder: Decoder.SPARKPLUG }
    } catch {
      return {
        error: 'Failed to decode sparkplugb payload',
        decoder: Decoder.NONE,
      }
    }
  },
}
