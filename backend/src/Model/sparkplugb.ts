const protobuf = require('protobufjs')
const sparkplugBProto = require('../../../res/sparkplug_b.proto')

export let Payload = undefined

export function loadSparkplugBPayload() {
  protobuf.load(sparkplugBProto).then((root: any) => {
    Payload = root.lookupType('com.cirruslink.sparkplug.protobuf.Payload')
  })
}
