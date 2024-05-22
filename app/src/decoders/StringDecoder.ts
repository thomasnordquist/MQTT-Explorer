import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { MessageDecoder } from './MessageDecoder'

export const StringDecoder: MessageDecoder = {
  formats: ['string'],
  decode(input: Base64Message): Base64Message {
    return input
  },
}
