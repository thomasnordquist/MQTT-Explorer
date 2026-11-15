import { Base64 } from 'js-base64'
import { TopicDataType } from './TreeNode'

export type Base64MessageDTO = Pick<Base64Message, 'base64Message'>

export class Base64Message {
  public base64Message: string
  private _unicodeValue: string | undefined

  // Todo: Rename to `encodedLength`
  public get length(): number {
    return this.base64Message.length
  }

  private get unicodeValue(): string {
    if (!this._unicodeValue) {
      this._unicodeValue = Base64.decode(this.base64Message ?? '')
    }

    return this._unicodeValue
  }

  constructor(base64Str?: string | Base64MessageDTO, error?: string) {
    if (typeof base64Str === 'string' || typeof base64Str === 'undefined') {
      this.base64Message = base64Str ?? ''
    } else {
      if (typeof base64Str.base64Message !== 'string') {
        throw new Error('Received unexpected type in copy constructor')
      }
      this.base64Message = base64Str.base64Message
    }
  }

  /**
   * Override default JSON serialization behavior to only return the DTO
   * @returns
   */
  public toJSON(): Base64MessageDTO {
    return { base64Message: this.base64Message }
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
      const hex = element.toString(16).toUpperCase()
      str += `0x${hex.length < 2 ? '0' + hex : hex} `
    })
    return str.trimRight()
  }

  public static toDataUri(message: Base64Message, mimeType: string) {
    return `data:${mimeType};base64,${message.base64Message}`
  }
}
