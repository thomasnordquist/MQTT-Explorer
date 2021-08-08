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

  public static toDataUri(message: Base64Message, mimeType: string) {
    return `data:${mimeType};base64,${message.base64Message}`
  }

  public static toUint8Array(message: Base64Message) {
    var binary_string = window.atob(message.base64Message);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes
  }
}
