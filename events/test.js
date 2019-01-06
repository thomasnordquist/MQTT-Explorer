const { EventEmitter } = require('events');

const a = new EventEmitter()
a.on('test', () => console.log('test'))
a.on('test2', () => console.log('test2'))
a.removeAllListeners('test')

a.emit('test')
a.emit('test2')
