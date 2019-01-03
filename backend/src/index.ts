import * as socketIO from 'socket.io'
const http = require('http')

import { TopicProperties, Tree, TreeNodeFactory } from './Model'
import { MqttSource, DataSource } from './DataSource'

const options = { url: 'mqtt://nodered' }
const dataSource = new MqttSource()

const a: any[] = []

const server = http.createServer()
const io = socketIO(server)
io.on('connection', (client) => {
  console.log('connection')
  a.forEach((b) => {
    io.emit('message', b)
  })
  client.on('disconnect', () => { /* … */ })
})
server.listen(3000)

const state = dataSource.connect(options)
dataSource.onMessage((topic: string, payload: Buffer) => {
  let buffer = payload
  if (a.length < 30) {
    a.push({ topic, payload: buffer.toString('base64') })
  }
  if (buffer.length > 10000) {
    buffer = buffer.slice(0, 10000)
  }

  io.emit('message', { topic, payload: buffer.toString('base64') })
})
