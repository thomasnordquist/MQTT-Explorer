import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { DecoderEnvelope } from './DecoderEnvelope'

export interface MessageDecoder<T = string> {
  /**
   * Can be used to
   * @param topic
   */
  formats: T[]
  canDecodeTopic?(topic: string): boolean
  canDecodeData?(data: Base64Message): boolean
  decode(input: Base64Message, format: T | string | undefined): DecoderEnvelope
}
