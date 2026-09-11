/**
 * The Sparkplug B topic grammar, as far as a decoder needs it.
 *
 * `spBv1.0/{group_id}/{message_type}/{edge_node_id}[/{device_id}]`
 */
export type SparkplugMessageType =
  | 'NBIRTH'
  | 'NDEATH'
  | 'NDATA'
  | 'NCMD'
  | 'DBIRTH'
  | 'DDEATH'
  | 'DDATA'
  | 'DCMD'
  | 'STATE'

export interface SparkplugTopic {
  namespace: string
  groupId: string
  messageType: SparkplugMessageType
  edgeNodeId: string
  deviceId?: string
}

const MESSAGE_TYPES: ReadonlySet<string> = new Set([
  'NBIRTH',
  'NDEATH',
  'NDATA',
  'NCMD',
  'DBIRTH',
  'DDEATH',
  'DDATA',
  'DCMD',
])

/**
 * Parse a Sparkplug topic, or return undefined when it is not one.
 *
 * STATE is deliberately excluded: its payload is JSON, not a protobuf Payload, so it is not
 * something this decoder should claim.
 */
export function parseSparkplugTopic(topic: string): SparkplugTopic | undefined {
  const segments = topic.split('/')
  if (segments.length < 4 || segments.length > 5) {
    return undefined
  }

  const [namespace, groupId, messageType, edgeNodeId, deviceId] = segments
  if (namespace !== 'spBv1.0' || !MESSAGE_TYPES.has(messageType)) {
    return undefined
  }
  if (!groupId || !edgeNodeId) {
    return undefined
  }
  // Only the D* verbs take a device segment, and they require one.
  const isDeviceVerb = messageType.startsWith('D')
  if (isDeviceVerb !== Boolean(deviceId)) {
    return undefined
  }

  return {
    namespace,
    groupId,
    messageType: messageType as SparkplugMessageType,
    edgeNodeId,
    deviceId,
  }
}

/**
 * Aliases are unique per EDGE NODE — a device's metrics share its edge node's alias space — so this
 * deliberately ignores the device segment.
 */
export function aliasScopeOf(topic: SparkplugTopic): string {
  return `${topic.groupId}/${topic.edgeNodeId}`
}
