import * as mqtt from 'mqtt'

const settings = {
  port: 1883,
}

let client: mqtt.MqttClient
function startServer(): Promise<mqtt.MqttClient> {
  return new Promise(async (resolve) => {
    // const server = new mosca.Server(settings)
    // await new Promise(resolve => server.once('ready', resolve))
    client = await connectMqtt()
    generateData(client)
    resolve(client)
  })
}

function connectMqtt(): Promise<mqtt.MqttClient> {
  return new Promise((resolve) => {
    const client = mqtt.connect('mqtt://127.0.0.1:1883', { username: 'thomas', password: 'bierbier' })
    client.once('connect', () => {
      resolve(client)
    })
  })
}

function temperature(base = 18, sineCoefficient = 2, offset = 0) {
  const temp = base + Math.sin(Date.now() / 1000 / 5 + offset) * sineCoefficient + Math.random()

  return String(Math.round(temp * 100) / 100)
}

export function stop() {
  for (const interval of intervals) {
    clearInterval(interval)
  }
  try {
    client && client.end()
  } catch {}
}

const intervals: any = []

function generateData(client: mqtt.MqttClient) {
  client.publish('livingroom/lamp/state', 'on', { retain: true, qos: 0 })
  client.publish('livingroom/lamp/brightness', '128', { retain: true, qos: 0 })
  client.publish('livingroom/thermostat/targetTemperature', '20°C', { retain: true, qos: 0 })
  intervals.push(setInterval(() => client.publish('livingroom/temperature', temperature()), 1000))
  intervals.push(setInterval(() => client.publish('livingroom/humidity', temperature(60, -2, 0)), 1000))

  client.publish('livingroom/lamp-1/state', 'on', { retain: true, qos: 0 })
  client.publish('livingroom/lamp-1/brightness', '48', { retain: true, qos: 0 })
  client.publish('livingroom/lamp-2/state', 'off', { retain: true, qos: 0 })
  client.publish('livingroom/lamp-2/brightness', '48', { retain: true, qos: 0 })

  client.publish('kitchen/lamp/state', 'off', { retain: true, qos: 0 })
  client.subscribe('kitchen/lamp/set')
  client.on('message', (topic, payload) => {
    if (topic === 'kitchen/lamp/set') {
      setTimeout(() => client.publish('kitchen/lamp/state', payload, { retain: true, qos: 0 }), 500)
    }
  })

  intervals.push(setInterval(() => client.publish('kitchen/temperature', temperature()), 1500))
  intervals.push(setInterval(() => client.publish('kitchen/humidity', temperature(60, -5, 0)), 1800))

  client.publish('garden/pump/state', 'off', { retain: true, qos: 0 })
  client.publish('garden/water/level', '70%', { retain: true, qos: 0 })
  client.publish('garden/lamps/state', 'off', { retain: true, qos: 0 })
  client.publish('garden/lamps/state', 'off', { retain: true, qos: 0 })

  client.publish('zigbee2mqtt/bridge/state', 'online', { retain: true, qos: 0 })
  client.publish('ble2mqtt/bridge/state', 'online', { retain: true, qos: 0 })

  // Used for demonstrating "clean up"
  client.publish('test 123', 'Hello world', { retain: true, qos: 0 })
  client.publish('hello', 'sunshine', { retain: true, qos: 0 })

  // Just stuff
  client.publish('01-80-C2-00-00-0F/LWT', 'offline', { retain: true, qos: 0 })

  intervals.push(setInterval(() => {
    client.publish('3d-printer/OctoPrint/temperature/bed', '{"_timestamp":1548589083,"actual":25.9,"target":0}')
    client.publish('3d-printer/OctoPrint/temperature/tool0', '{"_timestamp":1548589093,"actual":26.4,"target":0}')
  }, 3333))

  let state = true
  intervals.push(setInterval(() => {
    state = !state
    const js = {
      tags:{
        entityId: 33512,
        entityType: 'person',
        host: 'd44ad81e10f9',
        server: 'http://localhost/dataActuality',
        status: state ? 'live' : 'inactive',
      },
      timestamp: Date.now(),
    }
    client.publish(
      'actuality/showcase',
      JSON.stringify(js),
      { retain: true, qos: 0 },
    )
  }, 2102))
}

export default startServer
