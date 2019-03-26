import { MqttOptions } from '../../../backend/src/DataSource'
import { v4 } from 'uuid'
const sha1 = require('sha1')

export interface CertificateParameters {
  name: string
  /** @property data base64 encoded data */
  data: string
}
export interface ConnectionOptions {
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
  clientId?: string
  subscriptions: string[]
}

export function toMqttConnection(options: ConnectionOptions): MqttOptions | undefined {
  if (options.type !== 'mqtt') {
    return
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
  }
}

function generateClientId() {
  const clientIdSha = sha1(`${Math.random()}`).slice(0, 8)
  return `mqtt-explorer-${clientIdSha}`
}

export function createEmptyConnection(): ConnectionOptions {
  return {
    certValidation: true,
    clientId: generateClientId(),
    id: v4() as string,
    name: 'new connection',
    encryption: false,
    password: undefined,
    username: undefined,
    subscriptions: ['#', '$SYS/#'],
    type: 'mqtt',
    host: '',
    port: 1883,
    protocol: 'mqtt',
  }
}

export function makeDefaultConnections() {
  return {
    'iot.eclipse.org': {
      ...createEmptyConnection(),
      id: 'iot.eclipse.org',
      name: 'iot.eclipse.org',
      host: 'iot.eclipse.org',
    },
    'test.mosquitto.org': {
      ...createEmptyConnection(),
      id: 'test.mosquitto.org',
      name: 'test.mosquitto.org',
      host: 'test.mosquitto.org',
    },
  }
}
