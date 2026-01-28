import { ConfigMigrator, Migration } from '../../utils/ConfigMigrator'
import { ConnectionDictionary } from '../ConnectionManager'
import { ConnectionOptions } from '../../model/ConnectionOptions'

export interface ConnectionOptionsV0 {
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
  // selfSignedCertificate?: CertificateParameters
  // clientCertificate?: CertificateParameters
  // clientKey?: CertificateParameters
  clientId?: string
  subscriptions: Array<string>
}

const migrations: Migration[] = [
  // iot.eclipse.org ha moved to mqtt.eclipse.org
  {
    from: undefined,
    apply: (connection: ConnectionOptionsV0): ConnectionOptionsV0 => {
      if (connection.id == 'iot.eclipse.org' && connection.host == 'iot.eclipse.org' && connection.port == 1883) {
        return {
          ...connection,
          id: 'mqtt.eclipse.org',
          host: 'mqtt.eclipse.org',
          name: 'mqtt.eclipse.org',
        }
      }

      return {
        ...connection,
      }
    },
  },
  // Remove stored clientId if it is the default generated client id. This allows to connect multiple instances of mqtt explorer to the same broker.
  // A randomly generated clientId will be used if no clientId is set.
  {
    from: undefined,
    apply: (connection: ConnectionOptionsV0): ConnectionOptionsV0 => {
      if (connection.clientId && /mqtt-explorer-[0-9a-f]{8}/.test(connection.clientId)) {
        return {
          ...connection,
          clientId: undefined,
        }
      }

      return {
        ...connection,
      }
    },
  },
  // Added QoS level to subscription options
  {
    from: undefined,
    apply: (connection: ConnectionOptionsV0): ConnectionOptions => ({
      ...connection,
      configVersion: 1,
      subscriptions: connection.subscriptions.map(topic => ({ topic, qos: 0 })),
    }),
  },
]

const connectionMigrator = new ConfigMigrator(migrations)

function isMigrationNecessary(connections: ConnectionDictionary): boolean {
  return Object.values(connections)
    .map(connection => connectionMigrator.isMigrationNecessary(connection))
    .reduce((a, b) => a || b, false)
}

function applyMigrations(connections: ConnectionDictionary): ConnectionDictionary {
  const newConnectionDictionary: ConnectionDictionary = {}
  Object.keys(connections).forEach(key => {
    const newConnection = connectionMigrator.applyMigrations(connections[key]) as any
    newConnectionDictionary[newConnection.id] = newConnection
  })

  return newConnectionDictionary
}

export const connectionsMigrator = {
  isMigrationNecessary,
  applyMigrations,
}
