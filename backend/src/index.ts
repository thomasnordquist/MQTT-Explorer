import { TopicProperties, Tree, TreeNodeFactory } from './Model'
import { MqttSource, DataSource } from './DataSource'

import * as socketIO from 'socket.io'

const server = require('http').createServer();

let tree = new Tree()
let options = {url: 'mqtt://nodered'}
let dataSource = new MqttSource()
let count = 200

const a: Array<any> = []

const io = socketIO(server)
io.on('connection', client => {
  console.log('connection')
  a.forEach(b => {
    io.emit('message', b)
  })
  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });
});
server.listen(3000);

let state = dataSource.connect(options)
dataSource.onMessage((topic: string, payload: Buffer) => {
  if (payload.length > 10000) {
    payload = payload.slice(0, 10000)
  }

  io.emit('message', { topic, payload: payload.toString('base64') })
})

setTimeout(() => {
  dataSource.disconnect()
}, 1000000)
