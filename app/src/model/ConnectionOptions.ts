import { MqttOptions } from '../../../backend/src/DataSource'
import { v4 } from 'uuid'
const sha1 = require('sha1')

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
    certValidation: options.certValidation,
    subscriptions: options.subscriptions,
  }
}

export function generateClienId() {
  const clientIdSha = sha1(`${Math.random()}`).slice(0, 8)
  return `mqtt-explorer-${clientIdSha}`
}

export function createEmptyConnection(): ConnectionOptions {
  return {
    certValidation: true,
    clientId: generateClienId(),
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

export function defaultConnections() {
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
    'broker.hivemq.com:8000': {
      ...createEmptyConnection(),
      id: 'broker.hivemq.com:8000',
      name: 'broker.hivemq.com',
      host: 'broker.hivemq.com',
      basePath: 'ws',
      encryption: true,
      protocol: 'ws',
      port: 8000,
    },
  }
}
