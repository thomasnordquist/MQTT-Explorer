import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../backend/src/Model/Decoder'
import { DecoderEnvelope } from './DecoderEnvelope'
import { MessageDecoder } from './MessageDecoder'

type BinaryFormats =
  | 'int8'
  | 'int16'
  | 'int32'
  | 'int64'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'float'
  | 'double'

/**
 * Binary decode primitive binary data type and arrays of these
 */
export const BinaryDecoder: MessageDecoder<BinaryFormats> = {
  formats: ['int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64', 'float', 'double'],
  decode(input: Base64Message, format: BinaryFormats): DecoderEnvelope {
    const decodingOption = {
      int8: [Buffer.prototype.readInt8, 1],
      int16: [Buffer.prototype.readInt16LE, 2],
      int32: [Buffer.prototype.readInt32LE, 4],
      int64: [Buffer.prototype.readBigInt64LE, 8],
      uint8: [Buffer.prototype.readUint8, 1],
      uint16: [Buffer.prototype.readUint16LE, 2],
      uint32: [Buffer.prototype.readUint32LE, 4],
      uint64: [Buffer.prototype.readBigUint64LE, 8],
      float: [Buffer.prototype.readFloatLE, 4],
      double: [Buffer.prototype.readDoubleLE, 8],
    } as const

    const [readNumber, bytesToRead] = decodingOption[format]

    const buf = input.toBuffer()
    const str: string[] = []
    if (buf.length % bytesToRead !== 0) {
      return {
        error: 'Data type does not align with message',
        decoder: Decoder.NONE,
      }
    }
    for (let index = 0; index < buf.length; index += bytesToRead) {
      str.push((readNumber as any).apply(buf, [index]).toString())
    }

    return {
      message: Base64Message.fromString(JSON.stringify(str.length === 1 ? str[0] : str)),
      decoder: Decoder.NONE,
    }
  },
}
