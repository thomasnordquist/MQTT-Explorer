import { Base64Message } from 'mqtt-explorer-backend/src/Model/Base64Message'
import { Decoder } from 'mqtt-explorer-backend/src/Model/Decoder'
import { MessageDecoder } from './MessageDecoder'

export const StringDecoder: MessageDecoder = {
  formats: ['string'],
  decode(input: Base64Message) {
    return { message: input, decoder: Decoder.NONE }
  },
}
