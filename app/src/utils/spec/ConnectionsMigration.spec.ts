import 'mocha'
import { expect } from 'chai'
import { connectionsMigrator } from '../../actions/migrations/Connection'

describe('ConnectionsMigrator', () => {
  it('applies migrations', () => {
    const connections: any = {
      '763b2e5c-c1ed-4c9b-ac9a-0970b3be29a7': {
        certValidation: true,
        clientId: 'mqtt-explorer-2783f48c',
        encryption: false,
        host: 'nodered',
        id: '763b2e5c-c1ed-4c9b-ac9a-0970b3be29a7',
        name: 'nodered',
        port: 1883,
        protocol: 'mqtt',
        subscriptions: ['#', '$SYS/#'],
        type: 'mqtt',
      },
      'iot.eclipse.org': {
        certValidation: true,
        clientId: 'mqtt-explorer-d913aad3',
        encryption: false,
        host: 'iot.eclipse.org',
        id: 'iot.eclipse.org',
        name: 'iot.eclipse.org',
        port: 1883,
        protocol: 'mqtt',
        subscriptions: ['#', '$SYS/#'],
        type: 'mqtt',
      },
    }

    const migratedConnections: any = {
      '763b2e5c-c1ed-4c9b-ac9a-0970b3be29a7': {
        configVersion: 1,
        certValidation: true,
        clientId: undefined,
        encryption: false,
        host: 'nodered',
        id: '763b2e5c-c1ed-4c9b-ac9a-0970b3be29a7',
        name: 'nodered',
        port: 1883,
        protocol: 'mqtt',
        subscriptions: [
          { topic: '#', qos: 0 },
          { topic: '$SYS/#', qos: 0 },
        ],
        type: 'mqtt',
      },
      'mqtt.eclipse.org': {
        configVersion: 1,
        certValidation: true,
        clientId: undefined,
        encryption: false,
        host: 'mqtt.eclipse.org',
        id: 'mqtt.eclipse.org',
        name: 'mqtt.eclipse.org',
        port: 1883,
        protocol: 'mqtt',
        subscriptions: [
          { topic: '#', qos: 0 },
          { topic: '$SYS/#', qos: 0 },
        ],
        type: 'mqtt',
      },
    }

    expect(connectionsMigrator.applyMigrations(connections)).to.deep.eq(migratedConnections)
  })
})
