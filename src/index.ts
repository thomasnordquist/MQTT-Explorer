import { TopicProperties, Tree, TreeNodeFactory } from './Model'
import { MqttSource, DataSource } from './DataSource'
import { DotExport } from './DotExport'
// import { CytoscapeExport } from './CytoscapeExport'
// import { VisExport } from './VisExport'
import { writeFileSync } from 'fs'
import { spawn } from 'child_process'
import * as socketIO from 'socket.io'

const server = require('http').createServer();

let tree = new Tree()
let dataSource: DataSource = new MqttSource({url: 'mqtt://iot.eclipse.org', subscription: '#'})
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


dataSource.connect({
  readyCallback: () => {
    console.log('connected')
  },
  messageCallback: (topic, payload) => {
    // a.push({topic, payload})
    if (payload.length > 10000) {
      payload = payload.slice(0, 10000)
    }

    io.emit('message', {topic, payload: payload.toString('base64')})
    // console.log(topic)
    const edges = topic.split('/')
    let value = payload.toString()
    let node = TreeNodeFactory.fromEdgesAndValue(edges, value)
    tree.updateWithNode(node.firstNode())
  }
})

// function writeTree() {
//   // writeFileSync('./test.dot', DotExport.toDot(tree))
//   // writeFileSync('./test.json', CytoscapeExport.toDot(tree))
//   // writeFileSync('./vis.json', VisExport.toDot(tree))
//   // let p = spawn('dot', '-Tpng test.dot -o test2.png'.split(' '))
// }
//
// setInterval(() => {
//   writeTree()
// }, 2000)

setTimeout(() => {
  dataSource.disconnect()
}, 1000000)
