const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://127.0.0.1:1883');

client.on('connect', () => {
  console.log('Connected to broker');
  
  // Publish test topics
  client.publish('home/livingroom/temperature', '22.5');
  client.publish('home/livingroom/humidity', '45');
  client.publish('home/bedroom/temperature', '21.0');
  client.publish('home/kitchen/light', 'on');
  client.publish('sensors/motion/detected', 'true');
  
  console.log('Published 5 test messages');
  
  setTimeout(() => {
    client.end();
    console.log('Done');
  }, 1000);
});
