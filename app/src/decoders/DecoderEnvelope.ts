import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../backend/src/Model/Decoder'

export interface DecoderEnvelope {
  message?: Base64Message
  error?: string
  decoder: Decoder
}
