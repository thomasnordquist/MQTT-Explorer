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
  /**
   * @param topic the full topic, when the caller knows it. Optional so that existing decoders are
   * unaffected, but a stateful format needs it: Sparkplug sends metric names once in a birth
   * certificate and refers to them by alias afterwards, so resolving a DATA message means knowing
   * which edge node it came from.
   */
  decode(input: Base64Message, format: T | string | undefined, topic?: string): DecoderEnvelope
}
