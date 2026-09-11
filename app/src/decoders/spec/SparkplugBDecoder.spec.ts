import { expect } from 'chai'
import { org } from 'sparkplug-payload/lib/sparkplugPayloadProto'
import { Base64Message } from '../../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../../backend/src/Model/Decoder'
import { SparkplugDecoder } from '../SparkplugBDecoder'
import { sparkplugAliasCache } from '../SparkplugAliasCache'
import { parseSparkplugTopic } from '../SparkplugTopic'

const { Payload } = org.eclipse.tahu.protobuf

/** The shape the decoder renders: a JSON envelope around a metric list. */
interface DecodedMetric {
  name: string
  type: string
  value: unknown
  alias?: number
  timestamp?: string
  isHistorical?: boolean
  isTransient?: boolean
  isNull?: boolean
}

interface DecodedPayload {
  timestamp?: string
  seq?: number
  uuid?: string
  body?: string
  metrics: DecodedMetric[]
}

/** `canDecodeTopic` is optional on the interface; this decoder always defines it. */
function canDecodeTopic(topic: string): boolean {
  return SparkplugDecoder.canDecodeTopic?.(topic) ?? false
}

function parseDecoded(message: Base64Message | undefined): DecodedPayload {
  if (!message) {
    throw new Error('the decoder returned no message')
  }
  return JSON.parse(message.toUnicodeString())
}

const GROUP = 'fleet'
const NODE = 'bq-aabbccddeeff'
const NBIRTH = `spBv1.0/${GROUP}/NBIRTH/${NODE}`
const NDATA = `spBv1.0/${GROUP}/NDATA/${NODE}`

/** Build a payload from the protobuf definition, so a test can place a value in a CHOSEN field. */
function payload(fields: org.eclipse.tahu.protobuf.IPayload): Base64Message {
  const buffer = Payload.encode(Payload.create(fields)).finish()
  return Base64Message.fromBuffer(Buffer.from(buffer))
}

function decode(topic: string, message: Base64Message): DecodedPayload {
  const envelope = SparkplugDecoder.decode(message, undefined, topic)
  expect(envelope.error, envelope.error).to.equal(undefined)
  expect(envelope.decoder).to.equal(Decoder.SPARKPLUG)
  return parseDecoded(envelope.message)
}

describe('SparkplugBDecoder', () => {
  beforeEach(() => sparkplugAliasCache.clear())

  describe('topics', () => {
    it('recognises node and device messages', () => {
      expect(canDecodeTopic(NDATA)).to.equal(true)
      expect(canDecodeTopic(`spBv1.0/${GROUP}/DDATA/${NODE}/sensor-1`)).to.equal(true)
    })

    it('does not claim STATE, whose payload is JSON rather than protobuf', () => {
      expect(canDecodeTopic('spBv1.0/STATE/some-host')).to.equal(false)
    })

    it('rejects a device segment on a node verb, and a missing one on a device verb', () => {
      expect(parseSparkplugTopic(`spBv1.0/${GROUP}/NDATA/${NODE}/extra`)).to.equal(undefined)
      expect(parseSparkplugTopic(`spBv1.0/${GROUP}/DDATA/${NODE}`)).to.equal(undefined)
    })

    it('ignores unrelated topics', () => {
      expect(canDecodeTopic('home/livingroom/lamp')).to.equal(false)
      expect(canDecodeTopic('spBv1.0/g/NOPE/n')).to.equal(false)
    })
  })

  describe('alias resolution', () => {
    it('names a DATA metric using the birth certificate', () => {
      decode(
        NBIRTH,
        payload({
          timestamp: 1700000000000,
          seq: 0,
          metrics: [{ name: 'system/uptime', alias: 34, datatype: 7, intValue: 1 }],
        })
      )

      const data = decode(
        NDATA,
        payload({ timestamp: 1700000001000, seq: 1, metrics: [{ alias: 34, datatype: 7, intValue: 10073 }] })
      )

      expect(data.metrics[0].name).to.equal('system/uptime')
      expect(data.metrics[0].alias).to.equal(34)
      expect(data.metrics[0].value).to.equal(10073)
    })

    it('says so, rather than inventing a name, when no birth has been seen', () => {
      const data = decode(NDATA, payload({ seq: 1, metrics: [{ alias: 34, datatype: 7, intValue: 10073 }] }))

      expect(data.metrics[0].name).to.contain('alias 34')
      expect(data.metrics[0].name).to.contain('no birth certificate')
      // The value is still readable — an unnamed number beats nothing.
      expect(data.metrics[0].value).to.equal(10073)
    })

    it('lets a rebirth renumber, rather than resolving against the old map', () => {
      decode(NBIRTH, payload({ seq: 0, metrics: [{ name: 'first', alias: 1, datatype: 7, intValue: 0 }] }))
      decode(NBIRTH, payload({ seq: 0, metrics: [{ name: 'second', alias: 1, datatype: 7, intValue: 0 }] }))

      const data = decode(NDATA, payload({ seq: 1, metrics: [{ alias: 1, datatype: 7, intValue: 5 }] }))
      expect(data.metrics[0].name).to.equal('second')
    })

    it('keeps alias scopes separate per edge node', () => {
      decode(NBIRTH, payload({ seq: 0, metrics: [{ name: 'ours', alias: 7, datatype: 7, intValue: 0 }] }))

      const other = decode(
        `spBv1.0/${GROUP}/NDATA/bq-000000000000`,
        payload({ seq: 1, metrics: [{ alias: 7, datatype: 7, intValue: 1 }] })
      )
      expect(other.metrics[0].name).to.contain('no birth certificate')
    })
  })

  describe('values', () => {
    // 🔴 Implementations disagree about where a 32-bit unsigned lives: Eclipse Tahu (the reference)
    // writes UInt8/16/32 into int_value, while sparkplug-payload's own decodePayload() reads UInt32
    // out of long_value and returns null for a Tahu-conformant payload. A viewer has no stake in
    // the argument and should show the number either way.
    it('reads a UInt32 written by Tahu, in int_value', () => {
      const data = decode(NDATA, payload({ seq: 1, metrics: [{ name: 'n', datatype: 7, intValue: 10073 }] }))
      expect(data.metrics[0].value).to.equal(10073)
    })

    it('reads a UInt32 written by sparkplug-payload, in long_value', () => {
      const data = decode(NDATA, payload({ seq: 1, metrics: [{ name: 'n', datatype: 7, longValue: 10073 }] }))
      expect(data.metrics[0].value).to.equal(10073)
    })

    it('reads a signed Int32 back as negative', () => {
      // -1 travels as its two's-complement pattern in an unsigned field.
      const data = decode(NDATA, payload({ seq: 1, metrics: [{ name: 'n', datatype: 3, intValue: 4294967295 }] }))
      expect(data.metrics[0].value).to.equal(-1)
    })

    it('keeps a 64-bit value exact rather than rounding it through a double', () => {
      const data = decode(
        NDATA,
        payload({ seq: 1, metrics: [{ name: 'Properties/bq_seq', datatype: 8, longValue: 4294967802 }] })
      )
      expect(data.metrics[0].value).to.equal('4294967802')
    })

    it('renders the remaining scalar types', () => {
      const data = decode(
        NDATA,
        payload({
          seq: 1,
          metrics: [
            { name: 'b', datatype: 11, booleanValue: true },
            { name: 's', datatype: 12, stringValue: 'ACTIVE' },
            { name: 'd', datatype: 10, doubleValue: 12.5 },
          ],
        })
      )
      expect(data.metrics.map(m => m.value)).to.deep.equal([true, 'ACTIVE', 12.5])
      expect(data.metrics.map(m => m.type)).to.deep.equal(['Boolean', 'String', 'Double'])
    })

    it('marks a null metric as null rather than dropping it', () => {
      const data = decode(NDATA, payload({ seq: 1, metrics: [{ name: 'unsampled', datatype: 9, isNull: true }] }))
      expect(data.metrics[0].value).to.equal(null)
      expect(data.metrics[0].isNull).to.equal(true)
    })
  })

  describe('presentation', () => {
    it('renders timestamps as instants rather than 64-bit field pairs', () => {
      const data = decode(
        NDATA,
        payload({
          timestamp: 1700000000000,
          seq: 3,
          metrics: [{ name: 'n', datatype: 7, intValue: 1, timestamp: 1700000000000 }],
        })
      )
      expect(data.timestamp).to.equal('2023-11-14T22:13:20.000Z')
      expect(data.metrics[0].timestamp).to.equal('2023-11-14T22:13:20.000Z')
      expect(data.seq).to.equal(3)
    })

    it('carries is_historical through, since it changes what a reading means', () => {
      const data = decode(
        NDATA,
        payload({ seq: 1, metrics: [{ name: 'n', datatype: 7, intValue: 1, isHistorical: true }] })
      )
      expect(data.metrics[0].isHistorical).to.equal(true)
    })
  })

  describe('browser mode', () => {
    // The renderer has no `Buffer`, and nothing in the browser bundle polyfills it. A decoder that
    // reaches for one throws, gets caught, and returns an error envelope — which renders as an
    // empty value rather than as an error, so it does not look like a decoder problem at all.
    it('does not reach for a Buffer', () => {
      // Asserted by making `toBuffer()` throw rather than by removing the global, because
      // js-base64 chooses its Node or browser path when it is first loaded — deleting
      // `globalThis.Buffer` afterwards breaks that library rather than simulating a browser, and
      // the test would then fail for a reason the renderer never encounters.
      const message = payload({ seq: 1, metrics: [{ name: 'n', datatype: 7, intValue: 42 }] })
      const original = Base64Message.prototype.toBuffer
      Base64Message.prototype.toBuffer = () => {
        throw new ReferenceError('Buffer is not defined')
      }
      try {
        const data = decode(NDATA, message)
        expect(data.metrics[0].value).to.equal(42)
      } finally {
        Base64Message.prototype.toBuffer = original
      }
    })
  })

  describe('failure', () => {
    it('reports an undecodable payload instead of throwing', () => {
      const envelope = SparkplugDecoder.decode(Base64Message.fromString('not a protobuf payload'), undefined, NDATA)
      expect(envelope.decoder).to.equal(Decoder.NONE)
      expect(envelope.error).to.contain('Failed to decode')
    })

    it('still decodes when the caller gives no topic, without naming aliases', () => {
      const envelope = SparkplugDecoder.decode(
        payload({ seq: 1, metrics: [{ name: 'named', datatype: 7, intValue: 4 }] }),
        undefined,
        undefined
      )
      expect(envelope.decoder).to.equal(Decoder.SPARKPLUG)
      expect(parseDecoded(envelope.message).metrics[0].value).to.equal(4)
    })
  })
})
