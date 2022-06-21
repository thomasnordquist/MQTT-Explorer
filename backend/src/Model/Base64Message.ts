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

  /* Raw message conversions ('uint8' | 'uint16' | 'uint32' | 'uint64' | 'int8' | 'int16' | 'int32' | 'int64' | 'float' | 'double') */
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
        case 'uint8':
          {
            const uint = Base64Message.toUInt(message, 1)
            return [uint ? uint : '', undefined]
          }
        case 'uint16':
          {
            const uint = Base64Message.toUInt(message, 2)
            return [uint ? uint : '', undefined]
          }
        case 'uint32':
          {
            const uint = Base64Message.toUInt(message, 4)
            return [uint ? uint : '', undefined]
          }
        case 'uint64':
          {
            const uint = Base64Message.toUInt(message, 8)
            return [uint ? uint : '', undefined]
          }
        case 'int8':
          {
            const int = Base64Message.toInt(message, 1)
            return [int ? int : '', undefined]
          }
        case 'int16':
          {
            const int = Base64Message.toInt(message, 2)
            return [int ? int : '', undefined]
          }
        case 'int32':
          {
            const int = Base64Message.toInt(message, 4)
            return [int ? int : '', undefined]
          }
        case 'int64':
          {
            const int = Base64Message.toInt(message, 8)
            return [int ? int : '', undefined]
          }
        case 'float':
          {
            const float = Base64Message.toFloat(message, 4)
            return [float ? float : '', undefined]
          }
        case 'double':
          {
            const float = Base64Message.toFloat(message, 8)
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
      let hex = element.toString(16).toUpperCase();
      str += `0x${hex.length < 2 ? "0" + hex : hex} `
    })
    return str.trimRight()
  }

  public static toUInt(message: Base64Message, bytes: number) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let str: String[] = [];
    switch (bytes) {
      case 1:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readUInt8(index).toString())
        }
        break
      case 2:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readUInt16LE(index).toString())
        }
        break
      case 4:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readUInt32LE(index).toString())
        }
        break
      case 8:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readBigUInt64LE(index).toString())
        }
        break
      default:
        return undefined
    }
    return str.join(', ')
  }

  public static toInt(message: Base64Message, bytes: number) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let str: String[] = [];
    switch (bytes) {
      case 1:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readInt8(index).toString())
        }
        break
      case 2:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readInt16LE(index).toString())
        }
        break
      case 4:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readInt32LE(index).toString())
        }
        break
      case 8:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readBigInt64LE(index).toString())
        }
        break
      default:
        return undefined
    }
    return str.join(', ')
  }

  public static toFloat(message: Base64Message, bytes: number) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let str: String[] = [];
    switch (bytes) {
      case 4:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readFloatLE(index).toString())
        }
        break
      case 8:
        for (let index = 0; index < buf.length; index += bytes) {
          str.push(buf.readDoubleLE(index).toString())
        }
        break
      default:
        return undefined
    }
    return str.join(', ')
  }

  public static toDataUri(message: Base64Message, mimeType: string) {
    return `data:${mimeType};base64,${message.base64Message}`
  }
}
