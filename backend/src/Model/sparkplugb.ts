import { Base64Message } from './Base64Message'
import { Decoder } from './Decoder'
import { get } from 'sparkplug-payload'
var sparkplug = get('spBv1.0')

export interface IDecoder<T = string> {
  /**
   * Can be used to
   * @param topic
   */
  formats: T[]
  canDecodeTopic?(topic: string): boolean
  canDecodeData?(data: Base64Message): boolean
  decode(input: Base64Message, format: T | string | undefined): Base64Message
}

export const SparkplugDecoder: IDecoder = {
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

export const StringDecoder: IDecoder = {
  formats: ['string'],
  decode(input: Base64Message): Base64Message {
    return input
  },
}

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
export const BinaryDecoder: IDecoder<BinaryFormats> = {
  formats: ['int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64', 'float', 'double'],
  decode(input: Base64Message, format: BinaryFormats): Base64Message {
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
    let str: String[] = []
    if (buf.length % bytesToRead !== 0) {
      return new Base64Message(undefined, 'Data type does not align with message')
    }
    for (let index = 0; index < buf.length; index += bytesToRead) {
      str.push((readNumber as any).apply(buf, [index]).toString())
    }

    return Base64Message.fromString(JSON.stringify(str.length === 1 ? str[0] : str))
  },
}

export const decoders = [SparkplugDecoder, BinaryDecoder, StringDecoder] as const
