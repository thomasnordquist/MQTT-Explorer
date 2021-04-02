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

  public static toBase64(message: Base64Message) {
    return message.base64Message || ''
  }

  public static toUnicodeString(message: Base64Message) {
    return message.unicodeValue || ''
  }

  public static ToByteArray(message: Base64Message): Uint8Array {
    return Base64.toUint8Array(message.base64Message)
  }

  public static fromBuffer(buffer: Buffer) {
    return new Base64Message(buffer.toString('base64'))
  }

  public static fromString(str: string) {
    return new Base64Message(Base64.encode(str))
  }

  public static toDataUri(message: Base64Message, mimeType: string) {
    return `data:${mimeType};base64,${message.base64Message}`
  }
}
