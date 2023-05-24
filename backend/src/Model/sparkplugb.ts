import { readFileSync } from 'fs'
import * as protobuf from 'protobufjs'
import { Base64Message } from './Base64Message';
import { Decoder } from './Decoder';

//const buffer = readFileSync(require.resolve('../../../../res/sparkplug_b.proto'));
const buffer = readFileSync(require.resolve('../../../../res/tahu_sparkplug_b.proto'));
const root = protobuf.parse(buffer.toString()).root
//export let SparkplugPayload = root.lookupType('com.cirruslink.sparkplug.protobuf.Payload')
export let SparkplugPayload = root.lookupType('org.eclipse.tahu.protobuf.Payload')

export const SparkplugDecoder = {
  decode(input: Buffer): Base64Message | undefined {
    try {
      let message = Base64Message.fromString(
        JSON.stringify(
          SparkplugPayload.toObject(SparkplugPayload.decode(new Uint8Array(input)), {
            enums: String,  // enums as string names
            longs: String     // longs as strings (requires long.js)
            //bytes: String,  // bytes as base64 encoded strings
            //defaults: true, // includes default values
            //arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
            //objects: true,  // populates empty objects (map fields) even if defaults=false
            //oneofs: true    // includes virtual oneof fields set to the present field's name
          })
        )
      )
      message.decoder = Decoder.SPARKPLUG
      return message
    } catch {
      // ignore
    }
  }
}
