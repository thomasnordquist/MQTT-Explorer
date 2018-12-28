import { connect as mqttConnect } from 'mqtt'
import { TopicProperties, Tree, TreeNodeFactory } from './Model'
import { DotExport } from './DotExport'
import { writeFileSync } from 'fs'
import { spawn } from 'child_process'

var client = mqttConnect('mqtt://test.mosquitto.org')
const topicSeparator = '/'

client.on('connect', function () {
  console.log('connected')
  client.subscribe('#', (err: Error) => {
    if (!err) {}
  })
})

let tree = new Tree()

client.on('message', function (topic, message) {
  // message is Buffer
  const edges = topic.split(topicSeparator)
  let value = message.toString()
  let node = TreeNodeFactory.fromEdgesAndValue(edges, value)
  tree.updateWithNode(node.firstNode())
})

function writeTree() {
  writeFileSync('./test.dot', DotExport.toDot(tree))
  let p = spawn('dot', '-Tpng test.dot -o test.png'.split(' '))
}

setInterval(() => {
  writeTree()
  console.log(tree)
}, 2000)

setTimeout(() => {
  console.log(tree)

  client.end()
}, 1000000)
