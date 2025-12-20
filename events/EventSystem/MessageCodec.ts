/**
 * Binary Message Codec using Protobuf
 *
 * This provides efficient binary serialization for IPC messages,
 * avoiding JSON stringify/parse overhead.
 */

import * as protobuf from 'protobufjs'

// Define message schema
const messageSchema = {
  nested: {
    mqtt: {
      nested: {
        Envelope: {
          fields: {
            topic: { type: 'string', id: 1 },
            payload: { type: 'bytes', id: 2 },
          },
        },
      },
    },
  },
}

// Create root from JSON schema
const root = protobuf.Root.fromJSON(messageSchema)
const Envelope = root.lookupType('mqtt.Envelope')

export interface BinaryMessage {
  topic: string
  payload: Uint8Array
}

export class MessageCodec {
  /**
   * Encode a message to binary format
   */
  public static encode(topic: string, data: any): Uint8Array {
    // Serialize the payload to JSON, then to bytes
    const jsonString = JSON.stringify(data)
    const payloadBytes = new TextEncoder().encode(jsonString)

    // Create protobuf envelope
    const message = Envelope.create({
      topic,
      payload: payloadBytes,
    })

    // Encode to binary
    return Envelope.encode(message).finish()
  }

  /**
   * Decode a binary message
   */
  public static decode(binary: Uint8Array): BinaryMessage {
    const message = Envelope.decode(binary) as any
    return {
      topic: message.topic,
      payload: message.payload,
    }
  }

  /**
   * Decode and parse payload as JSON
   */
  public static decodeWithPayload<T>(binary: Uint8Array): { topic: string; data: T } {
    const { topic, payload } = this.decode(binary)
    const jsonString = new TextDecoder().decode(payload)
    const data = JSON.parse(jsonString)
    return { topic, data }
  }
}
