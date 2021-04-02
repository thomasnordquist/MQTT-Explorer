interface Field {
  key: number
  value: any
}

class Protobuf {
  TYPE: number
  NUMBER: number
  MSB: number
  VALUE: number
  offset: number
  LENGTH: number
  data: Int8Array | Uint8Array

  constructor(data: Int8Array | Uint8Array) {
    this.data = data

    // Set up masks
    this.TYPE = 0x07
    this.NUMBER = 0x78
    this.MSB = 0x80
    this.VALUE = 0x7f

    // Declare offset and length
    this.offset = 0
    this.LENGTH = data.length
  }

  static decode(input: Int8Array | Uint8Array) {
    const pb = new Protobuf(input)
    return pb._parse()
  }

  _parse() {
    let object = {}
    // Continue reading whilst we still have data
    while (this.offset < this.LENGTH) {
      const field = this._parseField()
      object = this._addField(field, object)
    }
    // Throw an error if we have gone beyond the end of the data
    if (this.offset > this.LENGTH) {
      throw new Error('Exhausted Buffer')
    }
    return object
  }

  _addField(field: Field, object: any) {
    // Get the field key/values
    const key = field.key
    const value = field.value
    object[key] = Object.prototype.hasOwnProperty.call(object, key)
      ? object[key] instanceof Array
        ? object[key].concat([value])
        : [object[key], value]
      : value
    return object
  }

  _parseField() {
    // Get the field headers
    const header = this._fieldHeader()
    const type = header.type
    const key = header.key
    switch (type) {
      // varint
      case 0:
        return { key: key, value: this._varInt() }
      // fixed 64
      case 1:
        return { key: key, value: this._uint64() }
      // length delimited
      case 2:
        return { key: key, value: this._lenDelim() }
      // fixed 32
      case 5:
        return { key: key, value: this._uint32() }
      // unknown type
      default:
        throw new Error('Unknown type 0x' + type.toString(16))
    }
  }

  _fieldHeader() {
    // Make sure we call type then number to preserve offset
    return { type: this._fieldType(), key: this._fieldNumber() }
  }

  _fieldType() {
    // Field type stored in lower 3 bits of tag byte
    return this.data[this.offset] & this.TYPE
  }

  _fieldNumber() {
    let shift = -3
    let fieldNumber = 0
    do {
      fieldNumber +=
        shift < 28
          ? shift === -3
            ? (this.data[this.offset] & this.NUMBER) >> -shift
            : (this.data[this.offset] & this.VALUE) << shift
          : (this.data[this.offset] & this.VALUE) * Math.pow(2, shift)
      shift += 7
    } while ((this.data[this.offset++] & this.MSB) === this.MSB)
    return fieldNumber
  }

  _varInt() {
    let value = 0
    let shift = 0
    // Keep reading while upper bit set
    do {
      value +=
        shift < 28
          ? (this.data[this.offset] & this.VALUE) << shift
          : (this.data[this.offset] & this.VALUE) * Math.pow(2, shift)
      shift += 7
    } while ((this.data[this.offset++] & this.MSB) === this.MSB)
    return value
  }
  _uint64() {
    // Read off a Uint64
    let num =
      this.data[this.offset++] * 0x1000000 +
      (this.data[this.offset++] << 16) +
      (this.data[this.offset++] << 8) +
      this.data[this.offset++]
    num =
      num * 0x100000000 +
      this.data[this.offset++] * 0x1000000 +
      (this.data[this.offset++] << 16) +
      (this.data[this.offset++] << 8) +
      this.data[this.offset++]
    return num
  }
  _lenDelim() {
    // Read off the field length
    const length = this._varInt()
    const fieldBytes = this.data.slice(this.offset, this.offset + length)
    let field
    try {
      // Attempt to parse as a new Protobuf Object
      const pbObject = new Protobuf(fieldBytes)
      field = pbObject._parse()
    } catch (err) {
      // Otherwise treat as bytes
      field = this._byteArrayToChars(fieldBytes)
    }
    // Move the offset and return the field
    this.offset += length
    return field
  }
  _uint32() {
    // Use a dataview to read off the integer
    const dataview = new DataView(new Uint8Array(this.data.slice(this.offset, this.offset + 4)).buffer)
    const value = dataview.getUint32(0)
    this.offset += 4
    return value
  }
  _byteArrayToChars(byteArray: Int8Array | Uint8Array) {
    if (!byteArray) return ''
    let str = ''
    // String concatenation appears to be faster than an array join
    for (let i = 0; i < byteArray.length; ) {
      str += String.fromCharCode(byteArray[i++])
    }
    return str
  }
}

export default Protobuf
