import { Base64Message } from 'mqtt-explorer-backend/src/Model/Base64Message'
import { Decoder } from 'mqtt-explorer-backend/src/Model/Decoder'

export interface DecoderEnvelope {
  message?: Base64Message
  error?: string
  decoder: Decoder
}
