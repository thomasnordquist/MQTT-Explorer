import { Base64 } from 'js-base64'
import { Decoder } from './Decoder'
import { TopicDataType } from './TreeNode'

export class Base64Message {
  public base64Message: string
  private unicodeValue: string
  public error?: string
  public decoder: Decoder
  public length: number

  constructor(base64Str?: string, error?: string) {
    this.base64Message = base64Str ?? ''
    this.error = error
    this.unicodeValue = Base64.decode(base64Str ?? '')
    this.length = base64Str?.length ?? 0
    this.decoder = Decoder.NONE
  }

  public toUnicodeString() {
    return this.unicodeValue || ''
  }

  public static fromBuffer(buffer: Buffer) {
    return new Base64Message(buffer.toString('base64'))
  }

  public toBuffer(): Buffer {
    return Buffer.from(this.base64Message, 'base64')
  }

  public static fromString(str: string) {
    return new Base64Message(Base64.encode(str))
  }

  /* Raw message conversions ('uint8' | 'uint16' | 'uint32' | 'uint64' | 'int8' | 'int16' | 'int32' | 'int64' | 'float' | 'double') */
  public format(type: TopicDataType = 'string'): [string, 'json' | undefined] {
    try {
      switch (type) {
        case 'json': {
          const json = JSON.parse(this.toUnicodeString())
          return [JSON.stringify(json, undefined, '  '), 'json']
        }
        case 'hex': {
          const hex = Base64Message.toHex(this)
          return [hex, undefined]
        }
        default: {
          const str = this.toUnicodeString()
          return [str, undefined]
        }
      }
    } catch (error) {
      const str = this.toUnicodeString()
      return [str, undefined]
    }
  }

  public static toHex(message: Base64Message) {
    const buf = Buffer.from(message.base64Message, 'base64')

    let str: string = ''
    buf.forEach(element => {
      let hex = element.toString(16).toUpperCase()
      str += `0x${hex.length < 2 ? '0' + hex : hex} `
    })
    return str.trimRight()
  }

  public static toDataUri(message: Base64Message, mimeType: string) {
    return `data:${mimeType};base64,${message.base64Message}`
  }
}
