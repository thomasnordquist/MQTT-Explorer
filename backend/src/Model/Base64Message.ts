const Base64 = require('js-base64')

export class Base64Message {
  private base64Message: string
  public length: number

  private constructor(base64Str: string) {
    this.base64Message = base64Str
    this.length = base64Str.length
  }

  public static toUnicodeString(message: Base64Message) {
    return Base64.decode(message.base64Message)
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
