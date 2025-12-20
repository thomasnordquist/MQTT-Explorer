import * as mqtt from 'mqtt'

/**
 * Test-specific MQTT mock (no timers)
 *
 * This mock connects to the broker but doesn't publish any messages automatically.
 * Each test should publish only the messages it needs via the returned client.
 *
 * This is different from the demo video mock which uses timers.
 */

let mqttClient: mqtt.MqttClient | null = null

export async function createTestMock(): Promise<mqtt.MqttClient> {
  if (mqttClient) {
    return mqttClient
  }

  return new Promise(resolve => {
    const client = mqtt.connect('mqtt://127.0.0.1:1883', {
      username: '',
      password: '',
    })
    client.once('connect', () => {
      mqttClient = client
      resolve(client)
    })
  })
}

export function stopTestMock() {
  if (mqttClient) {
    try {
      mqttClient.end()
      mqttClient = null
    } catch {
      // ignore
    }
  }
}
