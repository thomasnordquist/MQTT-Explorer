const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://127.0.0.1:1883');

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Publish test messages
  client.publish('test/topic1', 'Hello from topic 1');
  client.publish('test/topic2', 'Hello from topic 2');
  client.publish('sensors/temperature', '22.5');
  client.publish('sensors/humidity', '65');
  client.publish('devices/light/status', 'on');
  
  console.log('Published test messages');
  
  setTimeout(() => {
    client.end();
    console.log('Done');
  }, 1000);
});

client.on('error', (err) => {
  console.error('MQTT error:', err);
  client.end();
});
