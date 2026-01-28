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

  // Use TESTS_MQTT_BROKER_HOST from environment, default to localhost
  const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
  const brokerPort = process.env.TESTS_MQTT_BROKER_PORT || '1883'
  const brokerUrl = `mqtt://${brokerHost}:${brokerPort}`

  console.log(`Connecting to MQTT broker at ${brokerUrl}`)

  return new Promise((resolve, reject) => {
    const client = mqtt.connect(brokerUrl, {
      username: '',
      password: '',
      connectTimeout: 10000,
      reconnectPeriod: 0, // Disable reconnect in tests
    })

    client.once('connect', () => {
      console.log('Successfully connected to MQTT broker')
      mqttClient = client
      console.log(`Connected to MQTT broker at ${brokerUrl}`)
      resolve(client)
    })

    client.once('error', err => {
      console.error('MQTT connection error:', err.message)
      reject(new Error(`Failed to connect to MQTT broker: ${err.message}`))
    })

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!mqttClient) {
        console.error('MQTT connection timeout - broker may not be running')
        reject(new Error('MQTT connection timeout after 15 seconds. Ensure Mosquitto is running on localhost:1883'))
      }
    }, 15000)
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
