/* eslint-disable */
import { util, configure, Writer, Reader } from 'protobufjs/minimal'
import * as Long from 'long'

export const protobufPackage = 'org.eclipse.tahu.protobuf'

/** Indexes of Data Types */
export enum DataType {
  /** Unknown - Unknown placeholder for future expansion. */
  Unknown = 0,
  /** Int8 - Basic Types */
  Int8 = 1,
  Int16 = 2,
  Int32 = 3,
  Int64 = 4,
  UInt8 = 5,
  UInt16 = 6,
  UInt32 = 7,
  UInt64 = 8,
  Float = 9,
  Double = 10,
  Boolean = 11,
  String = 12,
  DateTime = 13,
  Text = 14,
  /** UUID - Additional Metric Types */
  UUID = 15,
  DataSet = 16,
  Bytes = 17,
  File = 18,
  Template = 19,
  /** PropertySet - Additional PropertyValue Types */
  PropertySet = 20,
  PropertySetList = 21,
  /** Int8Array - Array Types */
  Int8Array = 22,
  Int16Array = 23,
  Int32Array = 24,
  Int64Array = 25,
  UInt8Array = 26,
  UInt16Array = 27,
  UInt32Array = 28,
  UInt64Array = 29,
  FloatArray = 30,
  DoubleArray = 31,
  BooleanArray = 32,
  StringArray = 33,
  DateTimeArray = 34,
  UNRECOGNIZED = -1,
}

export function dataTypeFromJSON(object: any): DataType {
  switch (object) {
    case 0:
    case 'Unknown':
      return DataType.Unknown
    case 1:
    case 'Int8':
      return DataType.Int8
    case 2:
    case 'Int16':
      return DataType.Int16
    case 3:
    case 'Int32':
      return DataType.Int32
    case 4:
    case 'Int64':
      return DataType.Int64
    case 5:
    case 'UInt8':
      return DataType.UInt8
    case 6:
    case 'UInt16':
      return DataType.UInt16
    case 7:
    case 'UInt32':
      return DataType.UInt32
    case 8:
    case 'UInt64':
      return DataType.UInt64
    case 9:
    case 'Float':
      return DataType.Float
    case 10:
    case 'Double':
      return DataType.Double
    case 11:
    case 'Boolean':
      return DataType.Boolean
    case 12:
    case 'String':
      return DataType.String
    case 13:
    case 'DateTime':
      return DataType.DateTime
    case 14:
    case 'Text':
      return DataType.Text
    case 15:
    case 'UUID':
      return DataType.UUID
    case 16:
    case 'DataSet':
      return DataType.DataSet
    case 17:
    case 'Bytes':
      return DataType.Bytes
    case 18:
    case 'File':
      return DataType.File
    case 19:
    case 'Template':
      return DataType.Template
    case 20:
    case 'PropertySet':
      return DataType.PropertySet
    case 21:
    case 'PropertySetList':
      return DataType.PropertySetList
    case 22:
    case 'Int8Array':
      return DataType.Int8Array
    case 23:
    case 'Int16Array':
      return DataType.Int16Array
    case 24:
    case 'Int32Array':
      return DataType.Int32Array
    case 25:
    case 'Int64Array':
      return DataType.Int64Array
    case 26:
    case 'UInt8Array':
      return DataType.UInt8Array
    case 27:
    case 'UInt16Array':
      return DataType.UInt16Array
    case 28:
    case 'UInt32Array':
      return DataType.UInt32Array
    case 29:
    case 'UInt64Array':
      return DataType.UInt64Array
    case 30:
    case 'FloatArray':
      return DataType.FloatArray
    case 31:
    case 'DoubleArray':
      return DataType.DoubleArray
    case 32:
    case 'BooleanArray':
      return DataType.BooleanArray
    case 33:
    case 'StringArray':
      return DataType.StringArray
    case 34:
    case 'DateTimeArray':
      return DataType.DateTimeArray
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DataType.UNRECOGNIZED
  }
}

export function dataTypeToJSON(object: DataType): string {
  switch (object) {
    case DataType.Unknown:
      return 'Unknown'
    case DataType.Int8:
      return 'Int8'
    case DataType.Int16:
      return 'Int16'
    case DataType.Int32:
      return 'Int32'
    case DataType.Int64:
      return 'Int64'
    case DataType.UInt8:
      return 'UInt8'
    case DataType.UInt16:
      return 'UInt16'
    case DataType.UInt32:
      return 'UInt32'
    case DataType.UInt64:
      return 'UInt64'
    case DataType.Float:
      return 'Float'
    case DataType.Double:
      return 'Double'
    case DataType.Boolean:
      return 'Boolean'
    case DataType.String:
      return 'String'
    case DataType.DateTime:
      return 'DateTime'
    case DataType.Text:
      return 'Text'
    case DataType.UUID:
      return 'UUID'
    case DataType.DataSet:
      return 'DataSet'
    case DataType.Bytes:
      return 'Bytes'
    case DataType.File:
      return 'File'
    case DataType.Template:
      return 'Template'
    case DataType.PropertySet:
      return 'PropertySet'
    case DataType.PropertySetList:
      return 'PropertySetList'
    case DataType.Int8Array:
      return 'Int8Array'
    case DataType.Int16Array:
      return 'Int16Array'
    case DataType.Int32Array:
      return 'Int32Array'
    case DataType.Int64Array:
      return 'Int64Array'
    case DataType.UInt8Array:
      return 'UInt8Array'
    case DataType.UInt16Array:
      return 'UInt16Array'
    case DataType.UInt32Array:
      return 'UInt32Array'
    case DataType.UInt64Array:
      return 'UInt64Array'
    case DataType.FloatArray:
      return 'FloatArray'
    case DataType.DoubleArray:
      return 'DoubleArray'
    case DataType.BooleanArray:
      return 'BooleanArray'
    case DataType.StringArray:
      return 'StringArray'
    case DataType.DateTimeArray:
      return 'DateTimeArray'
    default:
      return 'UNKNOWN'
  }
}

export interface Payload {
  /** Timestamp at message sending time */
  timestamp: number
  /** Repeated forever - no limit in Google Protobufs */
  metrics: Payload_Metric[]
  /** Sequence number */
  seq: number
  /** UUID to track message type in terms of schema definitions */
  uuid: string
  /** To optionally bypass the whole definition above */
  body: Buffer
}

export interface Payload_Template {
  /** The version of the Template to prevent mismatches */
  version: string
  /** Each metric includes a name, datatype, and optionally a value */
  metrics: Payload_Metric[]
  parameters: Payload_Template_Parameter[]
  /** Reference to a template if this is extending a Template or an instance - must exist if an instance */
  templateRef: string
  isDefinition: boolean
}

export interface Payload_Template_Parameter {
  name: string
  type: number
  intValue: number | undefined
  longValue: number | undefined
  floatValue: number | undefined
  doubleValue: number | undefined
  booleanValue: boolean | undefined
  stringValue: string | undefined
  extensionValue: Payload_Template_Parameter_ParameterValueExtension | undefined
}

export interface Payload_Template_Parameter_ParameterValueExtension {}

export interface Payload_DataSet {
  numOfColumns: number
  columns: string[]
  types: number[]
  rows: Payload_DataSet_Row[]
}

export interface Payload_DataSet_DataSetValue {
  intValue: number | undefined
  longValue: number | undefined
  floatValue: number | undefined
  doubleValue: number | undefined
  booleanValue: boolean | undefined
  stringValue: string | undefined
  extensionValue: Payload_DataSet_DataSetValue_DataSetValueExtension | undefined
}

export interface Payload_DataSet_DataSetValue_DataSetValueExtension {}

export interface Payload_DataSet_Row {
  elements: Payload_DataSet_DataSetValue[]
}

export interface Payload_PropertyValue {
  type: number
  isNull: boolean
  intValue: number | undefined
  longValue: number | undefined
  floatValue: number | undefined
  doubleValue: number | undefined
  booleanValue: boolean | undefined
  stringValue: string | undefined
  propertysetValue: Payload_PropertySet | undefined
  /** List of Property Values */
  propertysetsValue: Payload_PropertySetList | undefined
  extensionValue: Payload_PropertyValue_PropertyValueExtension | undefined
}

export interface Payload_PropertyValue_PropertyValueExtension {}

export interface Payload_PropertySet {
  /** Names of the properties */
  keys: string[]
  values: Payload_PropertyValue[]
}

export interface Payload_PropertySetList {
  propertyset: Payload_PropertySet[]
}

export interface Payload_MetaData {
  /** Bytes specific metadata */
  isMultiPart: boolean
  /** General metadata */
  contentType: string
  /** File size, String size, Multi-part size, etc */
  size: number
  /** Sequence number for multi-part messages */
  seq: number
  /** File metadata */
  fileName: string
  /** File type (i.e. xml, json, txt, cpp, etc) */
  fileType: string
  /** md5 of data */
  md5: string
  /** Catchalls and future expansion */
  description: string
}

export interface Payload_Metric {
  /** Metric name - should only be included on birth */
  name: string
  /** Metric alias - tied to name on birth and included in all later DATA messages */
  alias: number
  /** Timestamp associated with data acquisition time */
  timestamp: number
  /** DataType of the metric/tag value */
  datatype: number
  /** If this is historical data and should not update real time tag */
  isHistorical: boolean
  /** Tells consuming clients such as MQTT Engine to not store this as a tag */
  isTransient: boolean
  /** If this is null - explicitly say so rather than using -1, false, etc for some datatypes. */
  isNull: boolean
  /** Metadata for the payload */
  metadata: Payload_MetaData | undefined
  properties: Payload_PropertySet | undefined
  intValue: number | undefined
  longValue: number | undefined
  floatValue: number | undefined
  doubleValue: number | undefined
  booleanValue: boolean | undefined
  stringValue: string | undefined
  /** Bytes, File */
  bytesValue: Buffer | undefined
  datasetValue: Payload_DataSet | undefined
  templateValue: Payload_Template | undefined
  extensionValue: Payload_Metric_MetricValueExtension | undefined
}

export interface Payload_Metric_MetricValueExtension {}

const basePayload: object = { timestamp: 0, seq: 0, uuid: '' }

export const Payload = {
  encode(message: Payload, writer: Writer = Writer.create()): Writer {
    if (message.timestamp !== 0) {
      writer.uint32(8).uint64(message.timestamp)
    }
    for (const v of message.metrics) {
      Payload_Metric.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    if (message.seq !== 0) {
      writer.uint32(24).uint64(message.seq)
    }
    if (message.uuid !== '') {
      writer.uint32(34).string(message.uuid)
    }
    if (message.body.length !== 0) {
      writer.uint32(42).bytes(message.body)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload } as Payload
    message.metrics = []
    message.body = Buffer.alloc(0)
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.timestamp = longToNumber(reader.uint64() as Long)
          break
        case 2:
          message.metrics.push(Payload_Metric.decode(reader, reader.uint32()))
          break
        case 3:
          message.seq = longToNumber(reader.uint64() as Long)
          break
        case 4:
          message.uuid = reader.string()
          break
        case 5:
          message.body = reader.bytes() as Buffer
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload {
    const message = { ...basePayload } as Payload
    message.metrics = []
    message.body = Buffer.alloc(0)
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = Number(object.timestamp)
    } else {
      message.timestamp = 0
    }
    if (object.metrics !== undefined && object.metrics !== null) {
      for (const e of object.metrics) {
        message.metrics.push(Payload_Metric.fromJSON(e))
      }
    }
    if (object.seq !== undefined && object.seq !== null) {
      message.seq = Number(object.seq)
    } else {
      message.seq = 0
    }
    if (object.uuid !== undefined && object.uuid !== null) {
      message.uuid = String(object.uuid)
    } else {
      message.uuid = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = Buffer.from(bytesFromBase64(object.body))
    }
    return message
  },

  toJSON(message: Payload): unknown {
    const obj: any = {}
    message.timestamp !== undefined && (obj.timestamp = message.timestamp)
    if (message.metrics) {
      obj.metrics = message.metrics.map(e => (e ? Payload_Metric.toJSON(e) : undefined))
    } else {
      obj.metrics = []
    }
    message.seq !== undefined && (obj.seq = message.seq)
    message.uuid !== undefined && (obj.uuid = message.uuid)
    message.body !== undefined &&
      (obj.body = base64FromBytes(message.body !== undefined ? message.body : Buffer.alloc(0)))
    return obj
  },

  fromPartial(object: DeepPartial<Payload>): Payload {
    const message = { ...basePayload } as Payload
    message.metrics = []
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = object.timestamp
    } else {
      message.timestamp = 0
    }
    if (object.metrics !== undefined && object.metrics !== null) {
      for (const e of object.metrics) {
        message.metrics.push(Payload_Metric.fromPartial(e))
      }
    }
    if (object.seq !== undefined && object.seq !== null) {
      message.seq = object.seq
    } else {
      message.seq = 0
    }
    if (object.uuid !== undefined && object.uuid !== null) {
      message.uuid = object.uuid
    } else {
      message.uuid = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = object.body
    } else {
      message.body = Buffer.alloc(0)
    }
    return message
  },
}

const basePayload_Template: object = {
  version: '',
  templateRef: '',
  isDefinition: false,
}

export const Payload_Template = {
  encode(message: Payload_Template, writer: Writer = Writer.create()): Writer {
    if (message.version !== '') {
      writer.uint32(10).string(message.version)
    }
    for (const v of message.metrics) {
      Payload_Metric.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    for (const v of message.parameters) {
      Payload_Template_Parameter.encode(v!, writer.uint32(26).fork()).ldelim()
    }
    if (message.templateRef !== '') {
      writer.uint32(34).string(message.templateRef)
    }
    if (message.isDefinition === true) {
      writer.uint32(40).bool(message.isDefinition)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_Template {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload_Template } as Payload_Template
    message.metrics = []
    message.parameters = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.version = reader.string()
          break
        case 2:
          message.metrics.push(Payload_Metric.decode(reader, reader.uint32()))
          break
        case 3:
          message.parameters.push(Payload_Template_Parameter.decode(reader, reader.uint32()))
          break
        case 4:
          message.templateRef = reader.string()
          break
        case 5:
          message.isDefinition = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_Template {
    const message = { ...basePayload_Template } as Payload_Template
    message.metrics = []
    message.parameters = []
    if (object.version !== undefined && object.version !== null) {
      message.version = String(object.version)
    } else {
      message.version = ''
    }
    if (object.metrics !== undefined && object.metrics !== null) {
      for (const e of object.metrics) {
        message.metrics.push(Payload_Metric.fromJSON(e))
      }
    }
    if (object.parameters !== undefined && object.parameters !== null) {
      for (const e of object.parameters) {
        message.parameters.push(Payload_Template_Parameter.fromJSON(e))
      }
    }
    if (object.templateRef !== undefined && object.templateRef !== null) {
      message.templateRef = String(object.templateRef)
    } else {
      message.templateRef = ''
    }
    if (object.isDefinition !== undefined && object.isDefinition !== null) {
      message.isDefinition = Boolean(object.isDefinition)
    } else {
      message.isDefinition = false
    }
    return message
  },

  toJSON(message: Payload_Template): unknown {
    const obj: any = {}
    message.version !== undefined && (obj.version = message.version)
    if (message.metrics) {
      obj.metrics = message.metrics.map(e => (e ? Payload_Metric.toJSON(e) : undefined))
    } else {
      obj.metrics = []
    }
    if (message.parameters) {
      obj.parameters = message.parameters.map(e => (e ? Payload_Template_Parameter.toJSON(e) : undefined))
    } else {
      obj.parameters = []
    }
    message.templateRef !== undefined && (obj.templateRef = message.templateRef)
    message.isDefinition !== undefined && (obj.isDefinition = message.isDefinition)
    return obj
  },

  fromPartial(object: DeepPartial<Payload_Template>): Payload_Template {
    const message = { ...basePayload_Template } as Payload_Template
    message.metrics = []
    message.parameters = []
    if (object.version !== undefined && object.version !== null) {
      message.version = object.version
    } else {
      message.version = ''
    }
    if (object.metrics !== undefined && object.metrics !== null) {
      for (const e of object.metrics) {
        message.metrics.push(Payload_Metric.fromPartial(e))
      }
    }
    if (object.parameters !== undefined && object.parameters !== null) {
      for (const e of object.parameters) {
        message.parameters.push(Payload_Template_Parameter.fromPartial(e))
      }
    }
    if (object.templateRef !== undefined && object.templateRef !== null) {
      message.templateRef = object.templateRef
    } else {
      message.templateRef = ''
    }
    if (object.isDefinition !== undefined && object.isDefinition !== null) {
      message.isDefinition = object.isDefinition
    } else {
      message.isDefinition = false
    }
    return message
  },
}

const basePayload_Template_Parameter: object = { name: '', type: 0 }

export const Payload_Template_Parameter = {
  encode(message: Payload_Template_Parameter, writer: Writer = Writer.create()): Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name)
    }
    if (message.type !== 0) {
      writer.uint32(16).uint32(message.type)
    }
    if (message.intValue !== undefined) {
      writer.uint32(24).uint32(message.intValue)
    }
    if (message.longValue !== undefined) {
      writer.uint32(32).uint64(message.longValue)
    }
    if (message.floatValue !== undefined) {
      writer.uint32(45).float(message.floatValue)
    }
    if (message.doubleValue !== undefined) {
      writer.uint32(49).double(message.doubleValue)
    }
    if (message.booleanValue !== undefined) {
      writer.uint32(56).bool(message.booleanValue)
    }
    if (message.stringValue !== undefined) {
      writer.uint32(66).string(message.stringValue)
    }
    if (message.extensionValue !== undefined) {
      Payload_Template_Parameter_ParameterValueExtension.encode(
        message.extensionValue,
        writer.uint32(74).fork()
      ).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_Template_Parameter {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...basePayload_Template_Parameter,
    } as Payload_Template_Parameter
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string()
          break
        case 2:
          message.type = reader.uint32()
          break
        case 3:
          message.intValue = reader.uint32()
          break
        case 4:
          message.longValue = longToNumber(reader.uint64() as Long)
          break
        case 5:
          message.floatValue = reader.float()
          break
        case 6:
          message.doubleValue = reader.double()
          break
        case 7:
          message.booleanValue = reader.bool()
          break
        case 8:
          message.stringValue = reader.string()
          break
        case 9:
          message.extensionValue = Payload_Template_Parameter_ParameterValueExtension.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_Template_Parameter {
    const message = {
      ...basePayload_Template_Parameter,
    } as Payload_Template_Parameter
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name)
    } else {
      message.name = ''
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = Number(object.type)
    } else {
      message.type = 0
    }
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = Number(object.intValue)
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = Number(object.longValue)
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = Number(object.floatValue)
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = Number(object.doubleValue)
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = Boolean(object.booleanValue)
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = String(object.stringValue)
    } else {
      message.stringValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_Template_Parameter_ParameterValueExtension.fromJSON(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },

  toJSON(message: Payload_Template_Parameter): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.type !== undefined && (obj.type = message.type)
    message.intValue !== undefined && (obj.intValue = message.intValue)
    message.longValue !== undefined && (obj.longValue = message.longValue)
    message.floatValue !== undefined && (obj.floatValue = message.floatValue)
    message.doubleValue !== undefined && (obj.doubleValue = message.doubleValue)
    message.booleanValue !== undefined && (obj.booleanValue = message.booleanValue)
    message.stringValue !== undefined && (obj.stringValue = message.stringValue)
    message.extensionValue !== undefined &&
      (obj.extensionValue = message.extensionValue
        ? Payload_Template_Parameter_ParameterValueExtension.toJSON(message.extensionValue)
        : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<Payload_Template_Parameter>): Payload_Template_Parameter {
    const message = {
      ...basePayload_Template_Parameter,
    } as Payload_Template_Parameter
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name
    } else {
      message.name = ''
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type
    } else {
      message.type = 0
    }
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = object.intValue
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = object.longValue
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = object.floatValue
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = object.doubleValue
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = object.booleanValue
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = object.stringValue
    } else {
      message.stringValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_Template_Parameter_ParameterValueExtension.fromPartial(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },
}

const basePayload_Template_Parameter_ParameterValueExtension: object = {}

export const Payload_Template_Parameter_ParameterValueExtension = {
  encode(_: Payload_Template_Parameter_ParameterValueExtension, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_Template_Parameter_ParameterValueExtension {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...basePayload_Template_Parameter_ParameterValueExtension,
    } as Payload_Template_Parameter_ParameterValueExtension
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): Payload_Template_Parameter_ParameterValueExtension {
    const message = {
      ...basePayload_Template_Parameter_ParameterValueExtension,
    } as Payload_Template_Parameter_ParameterValueExtension
    return message
  },

  toJSON(_: Payload_Template_Parameter_ParameterValueExtension): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(
    _: DeepPartial<Payload_Template_Parameter_ParameterValueExtension>
  ): Payload_Template_Parameter_ParameterValueExtension {
    const message = {
      ...basePayload_Template_Parameter_ParameterValueExtension,
    } as Payload_Template_Parameter_ParameterValueExtension
    return message
  },
}

const basePayload_DataSet: object = { numOfColumns: 0, columns: '', types: 0 }

export const Payload_DataSet = {
  encode(message: Payload_DataSet, writer: Writer = Writer.create()): Writer {
    if (message.numOfColumns !== 0) {
      writer.uint32(8).uint64(message.numOfColumns)
    }
    for (const v of message.columns) {
      writer.uint32(18).string(v!)
    }
    writer.uint32(26).fork()
    for (const v of message.types) {
      writer.uint32(v)
    }
    writer.ldelim()
    for (const v of message.rows) {
      Payload_DataSet_Row.encode(v!, writer.uint32(34).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_DataSet {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload_DataSet } as Payload_DataSet
    message.columns = []
    message.types = []
    message.rows = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.numOfColumns = longToNumber(reader.uint64() as Long)
          break
        case 2:
          message.columns.push(reader.string())
          break
        case 3:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos
            while (reader.pos < end2) {
              message.types.push(reader.uint32())
            }
          } else {
            message.types.push(reader.uint32())
          }
          break
        case 4:
          message.rows.push(Payload_DataSet_Row.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_DataSet {
    const message = { ...basePayload_DataSet } as Payload_DataSet
    message.columns = []
    message.types = []
    message.rows = []
    if (object.numOfColumns !== undefined && object.numOfColumns !== null) {
      message.numOfColumns = Number(object.numOfColumns)
    } else {
      message.numOfColumns = 0
    }
    if (object.columns !== undefined && object.columns !== null) {
      for (const e of object.columns) {
        message.columns.push(String(e))
      }
    }
    if (object.types !== undefined && object.types !== null) {
      for (const e of object.types) {
        message.types.push(Number(e))
      }
    }
    if (object.rows !== undefined && object.rows !== null) {
      for (const e of object.rows) {
        message.rows.push(Payload_DataSet_Row.fromJSON(e))
      }
    }
    return message
  },

  toJSON(message: Payload_DataSet): unknown {
    const obj: any = {}
    message.numOfColumns !== undefined && (obj.numOfColumns = message.numOfColumns)
    if (message.columns) {
      obj.columns = message.columns.map(e => e)
    } else {
      obj.columns = []
    }
    if (message.types) {
      obj.types = message.types.map(e => e)
    } else {
      obj.types = []
    }
    if (message.rows) {
      obj.rows = message.rows.map(e => (e ? Payload_DataSet_Row.toJSON(e) : undefined))
    } else {
      obj.rows = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<Payload_DataSet>): Payload_DataSet {
    const message = { ...basePayload_DataSet } as Payload_DataSet
    message.columns = []
    message.types = []
    message.rows = []
    if (object.numOfColumns !== undefined && object.numOfColumns !== null) {
      message.numOfColumns = object.numOfColumns
    } else {
      message.numOfColumns = 0
    }
    if (object.columns !== undefined && object.columns !== null) {
      for (const e of object.columns) {
        message.columns.push(e)
      }
    }
    if (object.types !== undefined && object.types !== null) {
      for (const e of object.types) {
        message.types.push(e)
      }
    }
    if (object.rows !== undefined && object.rows !== null) {
      for (const e of object.rows) {
        message.rows.push(Payload_DataSet_Row.fromPartial(e))
      }
    }
    return message
  },
}

const basePayload_DataSet_DataSetValue: object = {}

export const Payload_DataSet_DataSetValue = {
  encode(message: Payload_DataSet_DataSetValue, writer: Writer = Writer.create()): Writer {
    if (message.intValue !== undefined) {
      writer.uint32(8).uint32(message.intValue)
    }
    if (message.longValue !== undefined) {
      writer.uint32(16).uint64(message.longValue)
    }
    if (message.floatValue !== undefined) {
      writer.uint32(29).float(message.floatValue)
    }
    if (message.doubleValue !== undefined) {
      writer.uint32(33).double(message.doubleValue)
    }
    if (message.booleanValue !== undefined) {
      writer.uint32(40).bool(message.booleanValue)
    }
    if (message.stringValue !== undefined) {
      writer.uint32(50).string(message.stringValue)
    }
    if (message.extensionValue !== undefined) {
      Payload_DataSet_DataSetValue_DataSetValueExtension.encode(
        message.extensionValue,
        writer.uint32(58).fork()
      ).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_DataSet_DataSetValue {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...basePayload_DataSet_DataSetValue,
    } as Payload_DataSet_DataSetValue
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.intValue = reader.uint32()
          break
        case 2:
          message.longValue = longToNumber(reader.uint64() as Long)
          break
        case 3:
          message.floatValue = reader.float()
          break
        case 4:
          message.doubleValue = reader.double()
          break
        case 5:
          message.booleanValue = reader.bool()
          break
        case 6:
          message.stringValue = reader.string()
          break
        case 7:
          message.extensionValue = Payload_DataSet_DataSetValue_DataSetValueExtension.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_DataSet_DataSetValue {
    const message = {
      ...basePayload_DataSet_DataSetValue,
    } as Payload_DataSet_DataSetValue
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = Number(object.intValue)
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = Number(object.longValue)
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = Number(object.floatValue)
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = Number(object.doubleValue)
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = Boolean(object.booleanValue)
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = String(object.stringValue)
    } else {
      message.stringValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_DataSet_DataSetValue_DataSetValueExtension.fromJSON(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },

  toJSON(message: Payload_DataSet_DataSetValue): unknown {
    const obj: any = {}
    message.intValue !== undefined && (obj.intValue = message.intValue)
    message.longValue !== undefined && (obj.longValue = message.longValue)
    message.floatValue !== undefined && (obj.floatValue = message.floatValue)
    message.doubleValue !== undefined && (obj.doubleValue = message.doubleValue)
    message.booleanValue !== undefined && (obj.booleanValue = message.booleanValue)
    message.stringValue !== undefined && (obj.stringValue = message.stringValue)
    message.extensionValue !== undefined &&
      (obj.extensionValue = message.extensionValue
        ? Payload_DataSet_DataSetValue_DataSetValueExtension.toJSON(message.extensionValue)
        : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<Payload_DataSet_DataSetValue>): Payload_DataSet_DataSetValue {
    const message = {
      ...basePayload_DataSet_DataSetValue,
    } as Payload_DataSet_DataSetValue
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = object.intValue
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = object.longValue
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = object.floatValue
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = object.doubleValue
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = object.booleanValue
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = object.stringValue
    } else {
      message.stringValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_DataSet_DataSetValue_DataSetValueExtension.fromPartial(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },
}

const basePayload_DataSet_DataSetValue_DataSetValueExtension: object = {}

export const Payload_DataSet_DataSetValue_DataSetValueExtension = {
  encode(_: Payload_DataSet_DataSetValue_DataSetValueExtension, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_DataSet_DataSetValue_DataSetValueExtension {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...basePayload_DataSet_DataSetValue_DataSetValueExtension,
    } as Payload_DataSet_DataSetValue_DataSetValueExtension
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): Payload_DataSet_DataSetValue_DataSetValueExtension {
    const message = {
      ...basePayload_DataSet_DataSetValue_DataSetValueExtension,
    } as Payload_DataSet_DataSetValue_DataSetValueExtension
    return message
  },

  toJSON(_: Payload_DataSet_DataSetValue_DataSetValueExtension): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(
    _: DeepPartial<Payload_DataSet_DataSetValue_DataSetValueExtension>
  ): Payload_DataSet_DataSetValue_DataSetValueExtension {
    const message = {
      ...basePayload_DataSet_DataSetValue_DataSetValueExtension,
    } as Payload_DataSet_DataSetValue_DataSetValueExtension
    return message
  },
}

const basePayload_DataSet_Row: object = {}

export const Payload_DataSet_Row = {
  encode(message: Payload_DataSet_Row, writer: Writer = Writer.create()): Writer {
    for (const v of message.elements) {
      Payload_DataSet_DataSetValue.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_DataSet_Row {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload_DataSet_Row } as Payload_DataSet_Row
    message.elements = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.elements.push(Payload_DataSet_DataSetValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_DataSet_Row {
    const message = { ...basePayload_DataSet_Row } as Payload_DataSet_Row
    message.elements = []
    if (object.elements !== undefined && object.elements !== null) {
      for (const e of object.elements) {
        message.elements.push(Payload_DataSet_DataSetValue.fromJSON(e))
      }
    }
    return message
  },

  toJSON(message: Payload_DataSet_Row): unknown {
    const obj: any = {}
    if (message.elements) {
      obj.elements = message.elements.map(e => (e ? Payload_DataSet_DataSetValue.toJSON(e) : undefined))
    } else {
      obj.elements = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<Payload_DataSet_Row>): Payload_DataSet_Row {
    const message = { ...basePayload_DataSet_Row } as Payload_DataSet_Row
    message.elements = []
    if (object.elements !== undefined && object.elements !== null) {
      for (const e of object.elements) {
        message.elements.push(Payload_DataSet_DataSetValue.fromPartial(e))
      }
    }
    return message
  },
}

const basePayload_PropertyValue: object = { type: 0, isNull: false }

export const Payload_PropertyValue = {
  encode(message: Payload_PropertyValue, writer: Writer = Writer.create()): Writer {
    if (message.type !== 0) {
      writer.uint32(8).uint32(message.type)
    }
    if (message.isNull === true) {
      writer.uint32(16).bool(message.isNull)
    }
    if (message.intValue !== undefined) {
      writer.uint32(24).uint32(message.intValue)
    }
    if (message.longValue !== undefined) {
      writer.uint32(32).uint64(message.longValue)
    }
    if (message.floatValue !== undefined) {
      writer.uint32(45).float(message.floatValue)
    }
    if (message.doubleValue !== undefined) {
      writer.uint32(49).double(message.doubleValue)
    }
    if (message.booleanValue !== undefined) {
      writer.uint32(56).bool(message.booleanValue)
    }
    if (message.stringValue !== undefined) {
      writer.uint32(66).string(message.stringValue)
    }
    if (message.propertysetValue !== undefined) {
      Payload_PropertySet.encode(message.propertysetValue, writer.uint32(74).fork()).ldelim()
    }
    if (message.propertysetsValue !== undefined) {
      Payload_PropertySetList.encode(message.propertysetsValue, writer.uint32(82).fork()).ldelim()
    }
    if (message.extensionValue !== undefined) {
      Payload_PropertyValue_PropertyValueExtension.encode(message.extensionValue, writer.uint32(90).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_PropertyValue {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload_PropertyValue } as Payload_PropertyValue
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.type = reader.uint32()
          break
        case 2:
          message.isNull = reader.bool()
          break
        case 3:
          message.intValue = reader.uint32()
          break
        case 4:
          message.longValue = longToNumber(reader.uint64() as Long)
          break
        case 5:
          message.floatValue = reader.float()
          break
        case 6:
          message.doubleValue = reader.double()
          break
        case 7:
          message.booleanValue = reader.bool()
          break
        case 8:
          message.stringValue = reader.string()
          break
        case 9:
          message.propertysetValue = Payload_PropertySet.decode(reader, reader.uint32())
          break
        case 10:
          message.propertysetsValue = Payload_PropertySetList.decode(reader, reader.uint32())
          break
        case 11:
          message.extensionValue = Payload_PropertyValue_PropertyValueExtension.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_PropertyValue {
    const message = { ...basePayload_PropertyValue } as Payload_PropertyValue
    if (object.type !== undefined && object.type !== null) {
      message.type = Number(object.type)
    } else {
      message.type = 0
    }
    if (object.isNull !== undefined && object.isNull !== null) {
      message.isNull = Boolean(object.isNull)
    } else {
      message.isNull = false
    }
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = Number(object.intValue)
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = Number(object.longValue)
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = Number(object.floatValue)
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = Number(object.doubleValue)
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = Boolean(object.booleanValue)
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = String(object.stringValue)
    } else {
      message.stringValue = undefined
    }
    if (object.propertysetValue !== undefined && object.propertysetValue !== null) {
      message.propertysetValue = Payload_PropertySet.fromJSON(object.propertysetValue)
    } else {
      message.propertysetValue = undefined
    }
    if (object.propertysetsValue !== undefined && object.propertysetsValue !== null) {
      message.propertysetsValue = Payload_PropertySetList.fromJSON(object.propertysetsValue)
    } else {
      message.propertysetsValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_PropertyValue_PropertyValueExtension.fromJSON(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },

  toJSON(message: Payload_PropertyValue): unknown {
    const obj: any = {}
    message.type !== undefined && (obj.type = message.type)
    message.isNull !== undefined && (obj.isNull = message.isNull)
    message.intValue !== undefined && (obj.intValue = message.intValue)
    message.longValue !== undefined && (obj.longValue = message.longValue)
    message.floatValue !== undefined && (obj.floatValue = message.floatValue)
    message.doubleValue !== undefined && (obj.doubleValue = message.doubleValue)
    message.booleanValue !== undefined && (obj.booleanValue = message.booleanValue)
    message.stringValue !== undefined && (obj.stringValue = message.stringValue)
    message.propertysetValue !== undefined &&
      (obj.propertysetValue = message.propertysetValue
        ? Payload_PropertySet.toJSON(message.propertysetValue)
        : undefined)
    message.propertysetsValue !== undefined &&
      (obj.propertysetsValue = message.propertysetsValue
        ? Payload_PropertySetList.toJSON(message.propertysetsValue)
        : undefined)
    message.extensionValue !== undefined &&
      (obj.extensionValue = message.extensionValue
        ? Payload_PropertyValue_PropertyValueExtension.toJSON(message.extensionValue)
        : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<Payload_PropertyValue>): Payload_PropertyValue {
    const message = { ...basePayload_PropertyValue } as Payload_PropertyValue
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type
    } else {
      message.type = 0
    }
    if (object.isNull !== undefined && object.isNull !== null) {
      message.isNull = object.isNull
    } else {
      message.isNull = false
    }
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = object.intValue
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = object.longValue
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = object.floatValue
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = object.doubleValue
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = object.booleanValue
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = object.stringValue
    } else {
      message.stringValue = undefined
    }
    if (object.propertysetValue !== undefined && object.propertysetValue !== null) {
      message.propertysetValue = Payload_PropertySet.fromPartial(object.propertysetValue)
    } else {
      message.propertysetValue = undefined
    }
    if (object.propertysetsValue !== undefined && object.propertysetsValue !== null) {
      message.propertysetsValue = Payload_PropertySetList.fromPartial(object.propertysetsValue)
    } else {
      message.propertysetsValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_PropertyValue_PropertyValueExtension.fromPartial(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },
}

const basePayload_PropertyValue_PropertyValueExtension: object = {}

export const Payload_PropertyValue_PropertyValueExtension = {
  encode(_: Payload_PropertyValue_PropertyValueExtension, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_PropertyValue_PropertyValueExtension {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...basePayload_PropertyValue_PropertyValueExtension,
    } as Payload_PropertyValue_PropertyValueExtension
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): Payload_PropertyValue_PropertyValueExtension {
    const message = {
      ...basePayload_PropertyValue_PropertyValueExtension,
    } as Payload_PropertyValue_PropertyValueExtension
    return message
  },

  toJSON(_: Payload_PropertyValue_PropertyValueExtension): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(
    _: DeepPartial<Payload_PropertyValue_PropertyValueExtension>
  ): Payload_PropertyValue_PropertyValueExtension {
    const message = {
      ...basePayload_PropertyValue_PropertyValueExtension,
    } as Payload_PropertyValue_PropertyValueExtension
    return message
  },
}

const basePayload_PropertySet: object = { keys: '' }

export const Payload_PropertySet = {
  encode(message: Payload_PropertySet, writer: Writer = Writer.create()): Writer {
    for (const v of message.keys) {
      writer.uint32(10).string(v!)
    }
    for (const v of message.values) {
      Payload_PropertyValue.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_PropertySet {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload_PropertySet } as Payload_PropertySet
    message.keys = []
    message.values = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.keys.push(reader.string())
          break
        case 2:
          message.values.push(Payload_PropertyValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_PropertySet {
    const message = { ...basePayload_PropertySet } as Payload_PropertySet
    message.keys = []
    message.values = []
    if (object.keys !== undefined && object.keys !== null) {
      for (const e of object.keys) {
        message.keys.push(String(e))
      }
    }
    if (object.values !== undefined && object.values !== null) {
      for (const e of object.values) {
        message.values.push(Payload_PropertyValue.fromJSON(e))
      }
    }
    return message
  },

  toJSON(message: Payload_PropertySet): unknown {
    const obj: any = {}
    if (message.keys) {
      obj.keys = message.keys.map(e => e)
    } else {
      obj.keys = []
    }
    if (message.values) {
      obj.values = message.values.map(e => (e ? Payload_PropertyValue.toJSON(e) : undefined))
    } else {
      obj.values = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<Payload_PropertySet>): Payload_PropertySet {
    const message = { ...basePayload_PropertySet } as Payload_PropertySet
    message.keys = []
    message.values = []
    if (object.keys !== undefined && object.keys !== null) {
      for (const e of object.keys) {
        message.keys.push(e)
      }
    }
    if (object.values !== undefined && object.values !== null) {
      for (const e of object.values) {
        message.values.push(Payload_PropertyValue.fromPartial(e))
      }
    }
    return message
  },
}

const basePayload_PropertySetList: object = {}

export const Payload_PropertySetList = {
  encode(message: Payload_PropertySetList, writer: Writer = Writer.create()): Writer {
    for (const v of message.propertyset) {
      Payload_PropertySet.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_PropertySetList {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...basePayload_PropertySetList,
    } as Payload_PropertySetList
    message.propertyset = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.propertyset.push(Payload_PropertySet.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_PropertySetList {
    const message = {
      ...basePayload_PropertySetList,
    } as Payload_PropertySetList
    message.propertyset = []
    if (object.propertyset !== undefined && object.propertyset !== null) {
      for (const e of object.propertyset) {
        message.propertyset.push(Payload_PropertySet.fromJSON(e))
      }
    }
    return message
  },

  toJSON(message: Payload_PropertySetList): unknown {
    const obj: any = {}
    if (message.propertyset) {
      obj.propertyset = message.propertyset.map(e => (e ? Payload_PropertySet.toJSON(e) : undefined))
    } else {
      obj.propertyset = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<Payload_PropertySetList>): Payload_PropertySetList {
    const message = {
      ...basePayload_PropertySetList,
    } as Payload_PropertySetList
    message.propertyset = []
    if (object.propertyset !== undefined && object.propertyset !== null) {
      for (const e of object.propertyset) {
        message.propertyset.push(Payload_PropertySet.fromPartial(e))
      }
    }
    return message
  },
}

const basePayload_MetaData: object = {
  isMultiPart: false,
  contentType: '',
  size: 0,
  seq: 0,
  fileName: '',
  fileType: '',
  md5: '',
  description: '',
}

export const Payload_MetaData = {
  encode(message: Payload_MetaData, writer: Writer = Writer.create()): Writer {
    if (message.isMultiPart === true) {
      writer.uint32(8).bool(message.isMultiPart)
    }
    if (message.contentType !== '') {
      writer.uint32(18).string(message.contentType)
    }
    if (message.size !== 0) {
      writer.uint32(24).uint64(message.size)
    }
    if (message.seq !== 0) {
      writer.uint32(32).uint64(message.seq)
    }
    if (message.fileName !== '') {
      writer.uint32(42).string(message.fileName)
    }
    if (message.fileType !== '') {
      writer.uint32(50).string(message.fileType)
    }
    if (message.md5 !== '') {
      writer.uint32(58).string(message.md5)
    }
    if (message.description !== '') {
      writer.uint32(66).string(message.description)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_MetaData {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload_MetaData } as Payload_MetaData
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.isMultiPart = reader.bool()
          break
        case 2:
          message.contentType = reader.string()
          break
        case 3:
          message.size = longToNumber(reader.uint64() as Long)
          break
        case 4:
          message.seq = longToNumber(reader.uint64() as Long)
          break
        case 5:
          message.fileName = reader.string()
          break
        case 6:
          message.fileType = reader.string()
          break
        case 7:
          message.md5 = reader.string()
          break
        case 8:
          message.description = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_MetaData {
    const message = { ...basePayload_MetaData } as Payload_MetaData
    if (object.isMultiPart !== undefined && object.isMultiPart !== null) {
      message.isMultiPart = Boolean(object.isMultiPart)
    } else {
      message.isMultiPart = false
    }
    if (object.contentType !== undefined && object.contentType !== null) {
      message.contentType = String(object.contentType)
    } else {
      message.contentType = ''
    }
    if (object.size !== undefined && object.size !== null) {
      message.size = Number(object.size)
    } else {
      message.size = 0
    }
    if (object.seq !== undefined && object.seq !== null) {
      message.seq = Number(object.seq)
    } else {
      message.seq = 0
    }
    if (object.fileName !== undefined && object.fileName !== null) {
      message.fileName = String(object.fileName)
    } else {
      message.fileName = ''
    }
    if (object.fileType !== undefined && object.fileType !== null) {
      message.fileType = String(object.fileType)
    } else {
      message.fileType = ''
    }
    if (object.md5 !== undefined && object.md5 !== null) {
      message.md5 = String(object.md5)
    } else {
      message.md5 = ''
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = String(object.description)
    } else {
      message.description = ''
    }
    return message
  },

  toJSON(message: Payload_MetaData): unknown {
    const obj: any = {}
    message.isMultiPart !== undefined && (obj.isMultiPart = message.isMultiPart)
    message.contentType !== undefined && (obj.contentType = message.contentType)
    message.size !== undefined && (obj.size = message.size)
    message.seq !== undefined && (obj.seq = message.seq)
    message.fileName !== undefined && (obj.fileName = message.fileName)
    message.fileType !== undefined && (obj.fileType = message.fileType)
    message.md5 !== undefined && (obj.md5 = message.md5)
    message.description !== undefined && (obj.description = message.description)
    return obj
  },

  fromPartial(object: DeepPartial<Payload_MetaData>): Payload_MetaData {
    const message = { ...basePayload_MetaData } as Payload_MetaData
    if (object.isMultiPart !== undefined && object.isMultiPart !== null) {
      message.isMultiPart = object.isMultiPart
    } else {
      message.isMultiPart = false
    }
    if (object.contentType !== undefined && object.contentType !== null) {
      message.contentType = object.contentType
    } else {
      message.contentType = ''
    }
    if (object.size !== undefined && object.size !== null) {
      message.size = object.size
    } else {
      message.size = 0
    }
    if (object.seq !== undefined && object.seq !== null) {
      message.seq = object.seq
    } else {
      message.seq = 0
    }
    if (object.fileName !== undefined && object.fileName !== null) {
      message.fileName = object.fileName
    } else {
      message.fileName = ''
    }
    if (object.fileType !== undefined && object.fileType !== null) {
      message.fileType = object.fileType
    } else {
      message.fileType = ''
    }
    if (object.md5 !== undefined && object.md5 !== null) {
      message.md5 = object.md5
    } else {
      message.md5 = ''
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description
    } else {
      message.description = ''
    }
    return message
  },
}

const basePayload_Metric: object = {
  name: '',
  alias: 0,
  timestamp: 0,
  datatype: 0,
  isHistorical: false,
  isTransient: false,
  isNull: false,
}

export const Payload_Metric = {
  encode(message: Payload_Metric, writer: Writer = Writer.create()): Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name)
    }
    if (message.alias !== 0) {
      writer.uint32(16).uint64(message.alias)
    }
    if (message.timestamp !== 0) {
      writer.uint32(24).uint64(message.timestamp)
    }
    if (message.datatype !== 0) {
      writer.uint32(32).uint32(message.datatype)
    }
    if (message.isHistorical === true) {
      writer.uint32(40).bool(message.isHistorical)
    }
    if (message.isTransient === true) {
      writer.uint32(48).bool(message.isTransient)
    }
    if (message.isNull === true) {
      writer.uint32(56).bool(message.isNull)
    }
    if (message.metadata !== undefined) {
      Payload_MetaData.encode(message.metadata, writer.uint32(66).fork()).ldelim()
    }
    if (message.properties !== undefined) {
      Payload_PropertySet.encode(message.properties, writer.uint32(74).fork()).ldelim()
    }
    if (message.intValue !== undefined) {
      writer.uint32(80).uint32(message.intValue)
    }
    if (message.longValue !== undefined) {
      writer.uint32(88).uint64(message.longValue)
    }
    if (message.floatValue !== undefined) {
      writer.uint32(101).float(message.floatValue)
    }
    if (message.doubleValue !== undefined) {
      writer.uint32(105).double(message.doubleValue)
    }
    if (message.booleanValue !== undefined) {
      writer.uint32(112).bool(message.booleanValue)
    }
    if (message.stringValue !== undefined) {
      writer.uint32(122).string(message.stringValue)
    }
    if (message.bytesValue !== undefined) {
      writer.uint32(130).bytes(message.bytesValue)
    }
    if (message.datasetValue !== undefined) {
      Payload_DataSet.encode(message.datasetValue, writer.uint32(138).fork()).ldelim()
    }
    if (message.templateValue !== undefined) {
      Payload_Template.encode(message.templateValue, writer.uint32(146).fork()).ldelim()
    }
    if (message.extensionValue !== undefined) {
      Payload_Metric_MetricValueExtension.encode(message.extensionValue, writer.uint32(154).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_Metric {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePayload_Metric } as Payload_Metric
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string()
          break
        case 2:
          message.alias = longToNumber(reader.uint64() as Long)
          break
        case 3:
          message.timestamp = longToNumber(reader.uint64() as Long)
          break
        case 4:
          message.datatype = reader.uint32()
          break
        case 5:
          message.isHistorical = reader.bool()
          break
        case 6:
          message.isTransient = reader.bool()
          break
        case 7:
          message.isNull = reader.bool()
          break
        case 8:
          message.metadata = Payload_MetaData.decode(reader, reader.uint32())
          break
        case 9:
          message.properties = Payload_PropertySet.decode(reader, reader.uint32())
          break
        case 10:
          message.intValue = reader.uint32()
          break
        case 11:
          message.longValue = longToNumber(reader.uint64() as Long)
          break
        case 12:
          message.floatValue = reader.float()
          break
        case 13:
          message.doubleValue = reader.double()
          break
        case 14:
          message.booleanValue = reader.bool()
          break
        case 15:
          message.stringValue = reader.string()
          break
        case 16:
          message.bytesValue = reader.bytes() as Buffer
          break
        case 17:
          message.datasetValue = Payload_DataSet.decode(reader, reader.uint32())
          break
        case 18:
          message.templateValue = Payload_Template.decode(reader, reader.uint32())
          break
        case 19:
          message.extensionValue = Payload_Metric_MetricValueExtension.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Payload_Metric {
    const message = { ...basePayload_Metric } as Payload_Metric
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name)
    } else {
      message.name = ''
    }
    if (object.alias !== undefined && object.alias !== null) {
      message.alias = Number(object.alias)
    } else {
      message.alias = 0
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = Number(object.timestamp)
    } else {
      message.timestamp = 0
    }
    if (object.datatype !== undefined && object.datatype !== null) {
      message.datatype = Number(object.datatype)
    } else {
      message.datatype = 0
    }
    if (object.isHistorical !== undefined && object.isHistorical !== null) {
      message.isHistorical = Boolean(object.isHistorical)
    } else {
      message.isHistorical = false
    }
    if (object.isTransient !== undefined && object.isTransient !== null) {
      message.isTransient = Boolean(object.isTransient)
    } else {
      message.isTransient = false
    }
    if (object.isNull !== undefined && object.isNull !== null) {
      message.isNull = Boolean(object.isNull)
    } else {
      message.isNull = false
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = Payload_MetaData.fromJSON(object.metadata)
    } else {
      message.metadata = undefined
    }
    if (object.properties !== undefined && object.properties !== null) {
      message.properties = Payload_PropertySet.fromJSON(object.properties)
    } else {
      message.properties = undefined
    }
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = Number(object.intValue)
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = Number(object.longValue)
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = Number(object.floatValue)
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = Number(object.doubleValue)
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = Boolean(object.booleanValue)
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = String(object.stringValue)
    } else {
      message.stringValue = undefined
    }
    if (object.bytesValue !== undefined && object.bytesValue !== null) {
      message.bytesValue = Buffer.from(bytesFromBase64(object.bytesValue))
    }
    if (object.datasetValue !== undefined && object.datasetValue !== null) {
      message.datasetValue = Payload_DataSet.fromJSON(object.datasetValue)
    } else {
      message.datasetValue = undefined
    }
    if (object.templateValue !== undefined && object.templateValue !== null) {
      message.templateValue = Payload_Template.fromJSON(object.templateValue)
    } else {
      message.templateValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_Metric_MetricValueExtension.fromJSON(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },

  toJSON(message: Payload_Metric): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.alias !== undefined && (obj.alias = message.alias)
    message.timestamp !== undefined && (obj.timestamp = message.timestamp)
    message.datatype !== undefined && (obj.datatype = message.datatype)
    message.isHistorical !== undefined && (obj.isHistorical = message.isHistorical)
    message.isTransient !== undefined && (obj.isTransient = message.isTransient)
    message.isNull !== undefined && (obj.isNull = message.isNull)
    message.metadata !== undefined &&
      (obj.metadata = message.metadata ? Payload_MetaData.toJSON(message.metadata) : undefined)
    message.properties !== undefined &&
      (obj.properties = message.properties ? Payload_PropertySet.toJSON(message.properties) : undefined)
    message.intValue !== undefined && (obj.intValue = message.intValue)
    message.longValue !== undefined && (obj.longValue = message.longValue)
    message.floatValue !== undefined && (obj.floatValue = message.floatValue)
    message.doubleValue !== undefined && (obj.doubleValue = message.doubleValue)
    message.booleanValue !== undefined && (obj.booleanValue = message.booleanValue)
    message.stringValue !== undefined && (obj.stringValue = message.stringValue)
    message.bytesValue !== undefined &&
      (obj.bytesValue = message.bytesValue !== undefined ? base64FromBytes(message.bytesValue) : undefined)
    message.datasetValue !== undefined &&
      (obj.datasetValue = message.datasetValue ? Payload_DataSet.toJSON(message.datasetValue) : undefined)
    message.templateValue !== undefined &&
      (obj.templateValue = message.templateValue ? Payload_Template.toJSON(message.templateValue) : undefined)
    message.extensionValue !== undefined &&
      (obj.extensionValue = message.extensionValue
        ? Payload_Metric_MetricValueExtension.toJSON(message.extensionValue)
        : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<Payload_Metric>): Payload_Metric {
    const message = { ...basePayload_Metric } as Payload_Metric
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name
    } else {
      message.name = ''
    }
    if (object.alias !== undefined && object.alias !== null) {
      message.alias = object.alias
    } else {
      message.alias = 0
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = object.timestamp
    } else {
      message.timestamp = 0
    }
    if (object.datatype !== undefined && object.datatype !== null) {
      message.datatype = object.datatype
    } else {
      message.datatype = 0
    }
    if (object.isHistorical !== undefined && object.isHistorical !== null) {
      message.isHistorical = object.isHistorical
    } else {
      message.isHistorical = false
    }
    if (object.isTransient !== undefined && object.isTransient !== null) {
      message.isTransient = object.isTransient
    } else {
      message.isTransient = false
    }
    if (object.isNull !== undefined && object.isNull !== null) {
      message.isNull = object.isNull
    } else {
      message.isNull = false
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = Payload_MetaData.fromPartial(object.metadata)
    } else {
      message.metadata = undefined
    }
    if (object.properties !== undefined && object.properties !== null) {
      message.properties = Payload_PropertySet.fromPartial(object.properties)
    } else {
      message.properties = undefined
    }
    if (object.intValue !== undefined && object.intValue !== null) {
      message.intValue = object.intValue
    } else {
      message.intValue = undefined
    }
    if (object.longValue !== undefined && object.longValue !== null) {
      message.longValue = object.longValue
    } else {
      message.longValue = undefined
    }
    if (object.floatValue !== undefined && object.floatValue !== null) {
      message.floatValue = object.floatValue
    } else {
      message.floatValue = undefined
    }
    if (object.doubleValue !== undefined && object.doubleValue !== null) {
      message.doubleValue = object.doubleValue
    } else {
      message.doubleValue = undefined
    }
    if (object.booleanValue !== undefined && object.booleanValue !== null) {
      message.booleanValue = object.booleanValue
    } else {
      message.booleanValue = undefined
    }
    if (object.stringValue !== undefined && object.stringValue !== null) {
      message.stringValue = object.stringValue
    } else {
      message.stringValue = undefined
    }
    if (object.bytesValue !== undefined && object.bytesValue !== null) {
      message.bytesValue = object.bytesValue
    } else {
      message.bytesValue = undefined
    }
    if (object.datasetValue !== undefined && object.datasetValue !== null) {
      message.datasetValue = Payload_DataSet.fromPartial(object.datasetValue)
    } else {
      message.datasetValue = undefined
    }
    if (object.templateValue !== undefined && object.templateValue !== null) {
      message.templateValue = Payload_Template.fromPartial(object.templateValue)
    } else {
      message.templateValue = undefined
    }
    if (object.extensionValue !== undefined && object.extensionValue !== null) {
      message.extensionValue = Payload_Metric_MetricValueExtension.fromPartial(object.extensionValue)
    } else {
      message.extensionValue = undefined
    }
    return message
  },
}

const basePayload_Metric_MetricValueExtension: object = {}

export const Payload_Metric_MetricValueExtension = {
  encode(_: Payload_Metric_MetricValueExtension, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Payload_Metric_MetricValueExtension {
    const reader = input instanceof Reader ? input : new Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...basePayload_Metric_MetricValueExtension,
    } as Payload_Metric_MetricValueExtension
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): Payload_Metric_MetricValueExtension {
    const message = {
      ...basePayload_Metric_MetricValueExtension,
    } as Payload_Metric_MetricValueExtension
    return message
  },

  toJSON(_: Payload_Metric_MetricValueExtension): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<Payload_Metric_MetricValueExtension>): Payload_Metric_MetricValueExtension {
    const message = {
      ...basePayload_Metric_MetricValueExtension,
    } as Payload_Metric_MetricValueExtension
    return message
  },
}

declare var self: any | undefined
declare var window: any | undefined
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof self !== 'undefined') return self
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  throw 'Unable to locate global object'
})()

const atob: (b64: string) => string =
  globalThis.atob || (b64 => globalThis.Buffer.from(b64, 'base64').toString('binary'))
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i)
  }
  return arr
}

const btoa: (bin: string) => string =
  globalThis.btoa || (bin => globalThis.Buffer.from(bin, 'binary').toString('base64'))
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = []
  for (const byte of arr) {
    bin.push(String.fromCharCode(byte))
  }
  return btoa(bin.join(''))
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER')
  }
  return long.toNumber()
}

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any
  configure()
}
