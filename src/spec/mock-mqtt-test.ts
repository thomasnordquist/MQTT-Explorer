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

  // Use MQTT_BROKER_HOST from environment, default to localhost
  const brokerHost = process.env.MQTT_BROKER_HOST || '127.0.0.1'
  const brokerPort = process.env.MQTT_BROKER_PORT || '1883'
  const brokerUrl = `mqtt://${brokerHost}:${brokerPort}`

  console.log(`Connecting to MQTT broker at ${brokerUrl}`)

  return new Promise(resolve => {
    const client = mqtt.connect(brokerUrl, {
      username: '',
      password: '',
    })
    client.once('connect', () => {
      mqttClient = client
      console.log(`Connected to MQTT broker at ${brokerUrl}`)
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
