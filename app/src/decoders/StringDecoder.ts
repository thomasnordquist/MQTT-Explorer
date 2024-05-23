import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../backend/src/Model/Decoder'
import { MessageDecoder } from './MessageDecoder'

export const StringDecoder: MessageDecoder = {
  formats: ['string'],
  decode(input: Base64Message) {
    return { message: input, decoder: Decoder.NONE }
  },
}
