import { org } from 'sparkplug-payload/lib/sparkplugPayloadProto'
import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../backend/src/Model/Decoder'
import { MessageDecoder } from './MessageDecoder'
import { sparkplugAliasCache } from './SparkplugAliasCache'
import { SparkplugTopic, parseSparkplugTopic } from './SparkplugTopic'

const { Payload } = org.eclipse.tahu.protobuf

/**
 * Sparkplug B datatype codes (spec §6.4.17). The name is part of the output: a reader needs to know
 * that 10073 was a UInt32 rather than a Double, and the wire only carries the number.
 */
const DATA_TYPES: { [code: number]: string } = {
  1: 'Int8',
  2: 'Int16',
  3: 'Int32',
  4: 'Int64',
  5: 'UInt8',
  6: 'UInt16',
  7: 'UInt32',
  8: 'UInt64',
  9: 'Float',
  10: 'Double',
  11: 'Boolean',
  12: 'String',
  13: 'DateTime',
  14: 'Text',
  15: 'UUID',
  16: 'DataSet',
  17: 'Bytes',
  18: 'File',
  19: 'Template',
}

const SIGNED_WIDTHS: { [code: number]: number } = { 1: 8, 2: 16, 3: 32, 4: 64 }
const INT32_TYPES = new Set([1, 2, 3, 5, 6, 7])
const INT64_TYPES = new Set([4, 8, 13])

/**
 * A metric as `Payload.toObject()` hands it back. Written out rather than derived from the
 * generated types because `toObject` is declared as `{ [k: string]: any }`, which would make every
 * field below an implicit `any` and defeat the point of reading them carefully.
 *
 * 64-bit fields arrive as strings (`longs: String`), which is what keeps a bq_seq of
 * 4294967802 exact rather than rounding through a double.
 */
interface ProtoMetric {
  name?: string | null
  alias?: string | number | null
  timestamp?: string | number | null
  datatype?: number | null
  isHistorical?: boolean | null
  isTransient?: boolean | null
  isNull?: boolean | null
  intValue?: string | number | null
  longValue?: string | number | null
  floatValue?: number | null
  doubleValue?: number | null
  booleanValue?: boolean | null
  stringValue?: string | null
  bytesValue?: Uint8Array | null
  datasetValue?: unknown
  templateValue?: unknown
  extensionValue?: unknown
}

interface ProtoPayload {
  timestamp?: string | number | null
  seq?: string | number | null
  uuid?: string | null
  body?: Uint8Array | null
  metrics?: ProtoMetric[]
}

interface DecodedMetric {
  name: string
  alias?: number
  type: string
  value: unknown
  timestamp?: string
  isHistorical?: boolean
  isTransient?: boolean
  isNull?: boolean
}

/**
 * Signed integers travel as their two's-complement bit pattern in an unsigned field, so a -1 Int32
 * arrives as 4294967295. Reading it back as signed is the difference between a temperature of -1
 * and one of four billion.
 */
function toSigned(value: string | number, datatype: number): number | string {
  const width = SIGNED_WIDTHS[datatype]
  if (!width) {
    return value
  }
  if (width === 64) {
    const big = BigInt(value)
    return BigInt.asIntN(64, big).toString()
  }
  const num = Number(value)
  return num >= 2 ** (width - 1) ? num - 2 ** width : num
}

/** Epoch milliseconds as an ISO instant. Sparkplug timestamps are UTC by definition (spec §5.1). */
function formatTimestamp(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const ms = Number(value)
  if (!Number.isFinite(ms) || ms <= 0) {
    return undefined
  }
  return new Date(ms).toISOString()
}

/**
 * 🔴 Read the value from whichever field actually carries it.
 *
 * The datatype says which field a metric's value SHOULD be in, and implementations disagree about
 * where a 32-bit unsigned belongs: Eclipse Tahu — the reference implementation — writes UInt8/16/32
 * into `int_value`, while `sparkplug-payload`'s own high-level `decodePayload()` reads UInt32 out of
 * `long_value` and therefore returns null for a Tahu-conformant payload. Neither side is going to
 * change quickly, and a viewer has no stake in the argument: it should show the number.
 *
 * So the declared type picks the field to try FIRST, and the other integer field is a fallback.
 * This is why this decoder works against the protobuf definition rather than that helper.
 */
function hasField(metric: ProtoMetric, key: keyof ProtoMetric): boolean {
  return metric[key] !== undefined && metric[key] !== null
}

/** Int8..UInt64 and DateTime, whose value may arrive in either integer field. */
function readIntegerValue(metric: ProtoMetric, datatype: number): unknown {
  const preferred = INT32_TYPES.has(datatype) ? 'intValue' : 'longValue'
  const fallback = preferred === 'intValue' ? 'longValue' : 'intValue'

  let raw: unknown
  if (hasField(metric, preferred)) {
    raw = metric[preferred]
  } else if (hasField(metric, fallback)) {
    raw = metric[fallback]
  }
  if (raw === undefined) {
    return null
  }

  if (datatype === 13) {
    return formatTimestamp(raw as string | number) ?? String(raw)
  }
  // A 32-bit value renders as a NUMBER whichever field carried it. protobufjs hands back the
  // 64-bit field as a string (exactness for genuine 64-bit values), so without this the same
  // UInt32 metric would render as 10073 from one publisher and "10073" from another — a
  // difference in the wire's opinion showing up as a difference in the reading.
  const raw32 = INT32_TYPES.has(datatype) ? Number(raw) : (raw as string | number)
  return toSigned(raw32, datatype)
}

/** Everything that is not an integer: floats, boolean, the string family, bytes, and structures. */
function readOtherValue(metric: ProtoMetric, datatype: number): unknown {
  switch (datatype) {
    case 9:
      return hasField(metric, 'floatValue') ? metric.floatValue : null
    case 10:
      return hasField(metric, 'doubleValue') ? metric.doubleValue : null
    case 11:
      return hasField(metric, 'booleanValue') ? metric.booleanValue : null
    case 12:
    case 14:
    case 15:
      return hasField(metric, 'stringValue') ? metric.stringValue : null
    case 17:
    case 18:
      // Bytes and File are rendered as a length rather than a wall of base64 — the viewer already
      // has a raw view for anyone who wants the octets.
      return hasField(metric, 'bytesValue') ? `<${(metric.bytesValue as Uint8Array).length} bytes>` : null
    default:
      // DataSet, Template and anything the spec adds later: hand back the decoded structure as-is
      // rather than dropping it.
      return metric.datasetValue ?? metric.templateValue ?? metric.extensionValue ?? null
  }
}

function readValue(metric: ProtoMetric, datatype: number): unknown {
  if (metric.isNull) {
    return null
  }
  if (INT32_TYPES.has(datatype) || INT64_TYPES.has(datatype)) {
    return readIntegerValue(metric, datatype)
  }
  return readOtherValue(metric, datatype)
}

/**
 * A metric carries its name only in a birth certificate; afterwards it is an alias (spec §6.4.9).
 */
function metricName(metric: ProtoMetric, alias: number | undefined, topic: SparkplugTopic): string {
  const given = metric.name || ''
  if (given || alias === undefined) {
    return given
  }
  const known = sparkplugAliasCache.resolve(topic, alias)
  if (known) {
    return known.name
  }
  // Say what is wrong and why, rather than showing a bare number. A birth certificate is not
  // retained, so one that arrived before this viewer connected cannot be recovered by waiting.
  return `(alias ${alias} — no birth certificate seen for ${topic.edgeNodeId})`
}

/** Markers a metric may carry. Omitted unless set, so the common case stays terse. */
function metricFlags(metric: ProtoMetric): Partial<DecodedMetric> {
  const flags: Partial<DecodedMetric> = {}
  if (metric.isHistorical) {
    flags.isHistorical = true
  }
  if (metric.isTransient) {
    flags.isTransient = true
  }
  if (metric.isNull) {
    flags.isNull = true
  }
  return flags
}

function decodeMetric(metric: ProtoMetric, topic: SparkplugTopic): DecodedMetric {
  const datatype = Number(metric.datatype ?? 0)
  const alias = metric.alias === undefined || metric.alias === null ? undefined : Number(metric.alias)

  const decoded: DecodedMetric = {
    name: metricName(metric, alias, topic),
    type: DATA_TYPES[datatype] ?? `Unknown(${datatype})`,
    value: readValue(metric, datatype),
  }

  if (alias !== undefined) {
    decoded.alias = alias
  }
  const timestamp = formatTimestamp(metric.timestamp as string | undefined)
  if (timestamp) {
    decoded.timestamp = timestamp
  }

  return Object.assign(decoded, metricFlags(metric))
}

/** Birth certificates are the only messages that define aliases. */
const BIRTH_TYPES = new Set(['NBIRTH', 'DBIRTH'])

/** The payload envelope around the metrics: everything the viewer shows above the metric list. */
function decodePayload(
  payload: ProtoPayload,
  metrics: ProtoMetric[],
  scope: SparkplugTopic
): { [key: string]: unknown } {
  const decoded: { [key: string]: unknown } = {}
  const timestamp = formatTimestamp(payload.timestamp as string | undefined)
  if (timestamp) {
    decoded.timestamp = timestamp
  }
  if (payload.seq !== undefined && payload.seq !== null) {
    decoded.seq = Number(payload.seq)
  }
  decoded.metrics = metrics.map(metric => decodeMetric(metric, scope))
  if (payload.uuid) {
    decoded.uuid = payload.uuid
  }
  if (payload.body) {
    decoded.body = `<${payload.body.length} bytes>`
  }
  return decoded
}

export const SparkplugDecoder: MessageDecoder = {
  formats: ['Sparkplug'],
  canDecodeTopic(topic: string) {
    return parseSparkplugTopic(topic) !== undefined
  },
  decode(input, _format, topic) {
    const parsed = topic === undefined ? undefined : parseSparkplugTopic(topic)

    try {
      // toUint8Array rather than toBuffer: this runs in the renderer, and browser mode has no
      // `Buffer`. The failure was invisible until now because the decoder itself never ran.
      const payload: ProtoPayload = Payload.toObject(Payload.decode(input.toUint8Array()), {
        longs: String,
        bytes: Uint8Array,
        defaults: false,
      })

      // Without the topic there is no alias scope, so metrics can still be typed and formatted but
      // not named. Decoding is better than refusing; pretending to resolve would not be.
      const scope: SparkplugTopic = parsed ?? {
        namespace: 'spBv1.0',
        groupId: '',
        messageType: 'NDATA',
        edgeNodeId: '',
      }

      const metrics: ProtoMetric[] = payload.metrics ?? []
      if (parsed && BIRTH_TYPES.has(parsed.messageType)) {
        sparkplugAliasCache.learn(parsed, metrics)
      }

      const decoded = decodePayload(payload, metrics, scope)
      return { message: Base64Message.fromString(JSON.stringify(decoded)), decoder: Decoder.SPARKPLUG }
    } catch (error) {
      return {
        error: `Failed to decode sparkplugb payload: ${error instanceof Error ? error.message : String(error)}`,
        decoder: Decoder.NONE,
      }
    }
  },
}
