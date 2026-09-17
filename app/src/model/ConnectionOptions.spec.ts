import { expect } from 'chai'
import 'mocha'
import {
  ConnectionOptions,
  getWillError,
  getWillPayloadError,
  getWillTopicError,
  toMqttConnection,
} from './ConnectionOptions'

function makeConnection(overrides: Partial<ConnectionOptions> = {}): ConnectionOptions {
  return {
    configVersion: 1,
    type: 'mqtt',
    id: 'test-connection',
    host: 'broker.example.com',
    protocol: 'mqtt',
    port: 1883,
    name: 'Test broker',
    encryption: false,
    certValidation: true,
    subscriptions: [],
    ...overrides,
  }
}

describe('ConnectionOptions', () => {
  it('maps Last Will settings to MQTT connection options', () => {
    const will = {
      topic: 'clients/test/status',
      payload: 'offline',
      qos: 1 as const,
      retain: true,
    }

    const mqttConnection = toMqttConnection(makeConnection({ will }))

    expect(mqttConnection?.will).to.deep.equal(will)
  })

  it('accepts a valid Last Will topic', () => {
    const will = {
      topic: 'clients/test/status',
      payload: 'offline',
      qos: 0 as const,
      retain: false,
    }

    expect(getWillTopicError(will)).to.equal(undefined)
  })

  it('rejects empty and wildcard Last Will topics', () => {
    const emptyTopicWill = {
      topic: '',
      payload: '',
      qos: 0 as const,
      retain: false,
    }
    const wildcardTopicWill = {
      topic: 'clients/+/status',
      payload: '',
      qos: 0 as const,
      retain: false,
    }

    expect(getWillTopicError(emptyTopicWill)).to.equal('Last Will topic is required.')
    expect(getWillTopicError(wildcardTopicWill)).to.equal('Last Will topic cannot contain MQTT wildcards (+ or #).')
  })

  it('rejects Last Will topics larger than the MQTT UTF-8 length limit', () => {
    const oversizedTopic = 'é'.repeat(32_768)
    const will = {
      topic: oversizedTopic,
      payload: '',
      qos: 0 as const,
      retain: false,
    }

    expect(getWillTopicError(will)).to.equal('Last Will topic must be 65,535 UTF-8 bytes or fewer.')
    expect(getWillError(will)).to.equal('Last Will topic must be 65,535 UTF-8 bytes or fewer.')
  })

  it('rejects Last Will payloads larger than the MQTT binary-data length limit', () => {
    const oversizedPayload = 'é'.repeat(32_768)
    const will = {
      topic: 'clients/test/status',
      payload: oversizedPayload,
      qos: 0 as const,
      retain: false,
    }

    expect(getWillPayloadError(will)).to.equal('Last Will payload must be 65,535 UTF-8 bytes or fewer.')
    expect(getWillError(will)).to.equal('Last Will payload must be 65,535 UTF-8 bytes or fewer.')
  })

  it('accepts Last Will fields at the MQTT UTF-8 length limit', () => {
    const maximumLengthValue = 'a'.repeat(65_535)
    const will = {
      topic: maximumLengthValue,
      payload: maximumLengthValue,
      qos: 0 as const,
      retain: false,
    }

    expect(getWillError(will)).to.equal(undefined)
  })
})
