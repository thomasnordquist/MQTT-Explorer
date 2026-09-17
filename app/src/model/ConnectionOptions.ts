import { v4 } from 'uuid'
import { MqttWill, Subscription } from 'mqtt-explorer-backend/src/DataSource/MqttSource'
import sha1 from 'sha1'
import { MqttOptions } from 'mqtt-explorer-backend/src/DataSource/DataSource'

export interface CertificateParameters {
  name: string
  /** @property data base64 encoded data */
  data: string
}

export interface ConnectionOptions {
  configVersion: 1
  type: 'mqtt'
  id: string
  host: string
  protocol: 'mqtt' | 'ws'
  basePath?: string
  port: number
  name: string
  username?: string
  password?: string
  encryption: boolean
  certValidation: boolean
  selfSignedCertificate?: CertificateParameters
  clientCertificate?: CertificateParameters
  clientKey?: CertificateParameters
  clientId?: string
  subscriptions: Array<Subscription>
  will?: MqttWill
}

const maximumMqttLengthPrefixedFieldSize = 65_535

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

export function toMqttConnection(options: ConnectionOptions): MqttOptions | undefined {
  if (options.type !== 'mqtt') {
    return undefined
  }

  return {
    url: `${options.protocol}://${options.host}:${options.port}/${options.basePath || ''}`,
    username: options.username,
    password: options.password,
    tls: options.encryption,
    clientId: options.clientId,
    certValidation: options.certValidation,
    subscriptions: options.subscriptions,
    certificateAuthority: options.selfSignedCertificate ? options.selfSignedCertificate.data : undefined,
    clientCertificate: options.clientCertificate ? options.clientCertificate.data : undefined,
    clientKey: options.clientKey ? options.clientKey.data : undefined,
    will: options.will,
  }
}

export function getWillTopicError(will?: MqttWill): string | undefined {
  if (!will) {
    return undefined
  }
  if (will.topic.length === 0) {
    return 'Last Will topic is required.'
  }
  if (will.topic.includes('+') || will.topic.includes('#')) {
    return 'Last Will topic cannot contain MQTT wildcards (+ or #).'
  }
  if (will.topic.includes('\u0000')) {
    return 'Last Will topic cannot contain a null character.'
  }
  if (utf8ByteLength(will.topic) > maximumMqttLengthPrefixedFieldSize) {
    return 'Last Will topic must be 65,535 UTF-8 bytes or fewer.'
  }
  return undefined
}

export function getWillPayloadError(will?: MqttWill): string | undefined {
  if (!will) {
    return undefined
  }
  if (utf8ByteLength(will.payload) > maximumMqttLengthPrefixedFieldSize) {
    return 'Last Will payload must be 65,535 UTF-8 bytes or fewer.'
  }
  return undefined
}

export function getWillError(will?: MqttWill): string | undefined {
  return getWillTopicError(will) || getWillPayloadError(will)
}

function generateClientId() {
  const clientIdSha = sha1(`${Math.random()}`).slice(0, 8)
  return `mqtt-explorer-${clientIdSha}`
}

export function createEmptyConnection(): ConnectionOptions {
  return {
    configVersion: 1,
    certValidation: true,
    clientId: generateClientId(),
    id: v4() as string,
    name: 'new connection',
    encryption: false,
    password: undefined,
    username: undefined,
    subscriptions: [
      { topic: '#', qos: 0 },
      { topic: '$SYS/#', qos: 0 },
    ],
    type: 'mqtt',
    host: '',
    port: 1883,
    protocol: 'mqtt',
  }
}

export function makeDefaultConnections() {
  return {
    // remember: there was also iot.eclipse.org once
    'mqtt.eclipseprojects.io': {
      ...createEmptyConnection(),
      id: 'mqtt.eclipseprojects.io',
      name: 'mqtt.eclipseprojects.io',
      host: 'mqtt.eclipseprojects.io',
    },
    'test.mosquitto.org': {
      ...createEmptyConnection(),
      id: 'test.mosquitto.org',
      name: 'test.mosquitto.org',
      host: 'test.mosquitto.org',
    },
  }
}
