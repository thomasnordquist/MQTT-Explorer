import { TopicDataType } from "./TreeNode"

const { Base64 } = require('js-base64')

export class Base64Message {
  private base64Message: string
  private unicodeValue: string

  public length: number

  private constructor(base64Str: string) {
    this.base64Message = base64Str
    this.unicodeValue = Base64.decode(base64Str)
    this.length = base64Str.length
  }

  public static toUnicodeString(message: Base64Message) {
    return message.unicodeValue || ''
  }

  public static fromBuffer(buffer: Buffer) {
    return new Base64Message(buffer.toString('base64'))
  }

  public static fromString(str: string) {
    return new Base64Message(Base64.encode(str))
  }

  /* Raw message conversions (hex, uint, int, float) */
  public static format(message: Base64Message | null, type: TopicDataType = 'string'): [string, 'json' | undefined] {
    if (!message) {
      return ['', undefined]
    }

    try {
      switch (type) {
        case 'json':
          {
            const json = JSON.parse(Base64Message.toUnicodeString(message))
            return [JSON.stringify(json, undefined, '  '), 'json']
          }
        case 'hex':
          {
            const hex = Base64Message.toHex(message)
            return [hex, undefined]
          }
        case 'integer':
          {
            const int = Base64Message.toInt(message)
            return [int ? int : '', undefined]
          }
        case 'unsigned int':
          {
            const uint = Base64Message.toUInt(message)
            return [uint ? uint : '', undefined]
          }
        case 'floating point':
          {
            const float = Base64Message.toFloat(message)
            return [float ? float : '', undefined]
          }
        default:
          {
            const str = Base64Message.toUnicodeString(message)
            return [str, undefined]
          }
      }
    } catch (error) {
      const str = Base64Message.toUnicodeString(message)
      return [str, undefined]
    }
  }

  public static toHex(message: Base64Message) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let str: string = '';
    buf.forEach(element => {
      str += `0x${element.toString(16)} `
    })
    return str.trimRight()
  }

  public static toUInt(message: Base64Message) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let num: Number = 0;
    switch (buf.length) {
      case 1:
        num = buf.readUInt8(0)
        break
      case 2:
        num = buf.readUInt16LE(0)
        break
      case 4:
        num = buf.readUInt32LE(0)
        break
      case 8:
        num = Number(buf.readBigUInt64LE(0))
        break
      default:
        return undefined
    }
    return num.toString()
  }

  public static toInt(message: Base64Message) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let num: Number = 0;
    switch (buf.length) {
      case 1:
        num = buf.readInt8(0)
        break
      case 2:
        num = buf.readInt16LE(0)
        break
      case 4:
        num = buf.readInt32LE(0)
        break
      case 8:
        num = Number(buf.readBigInt64LE(0))
        break
      default:
        return undefined
    }
    return num.toString()
  }

  public static toFloat(message: Base64Message) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let num: Number = 0;
    switch (buf.length) {
      case 4:
        num = buf.readFloatLE(0)
        break
      case 8:
        num = buf.readDoubleLE(0)
        break
      default:
        return undefined
    }
    return num.toString()
  }

  public static toDataUri(message: Base64Message, mimeType: string) {
    return `data:${mimeType};base64,${message.base64Message}`
  }
}
