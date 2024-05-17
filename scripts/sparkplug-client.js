/********************************************************************************
 * Copyright (c) 2016-2018 Cirrus Link Solutions and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Cirrus Link Solutions - initial implementation
 ********************************************************************************/
var SparkplugClient = require('sparkplug-client')

/*
 * Main sample function which includes the run() function for running the sample
 */
var sample = (function () {
  var config = {
      serverUrl: 'tcp://127.0.0.1:1883',
      username: '',
      password: '',
      groupId: 'Sparkplug Devices',
      edgeNode: 'JavaScript Edge Node',
      clientId: 'JavaScriptSimpleEdgeNode',
      version: 'spBv1.0',
    },
    hwVersion = 'Emulated Hardware',
    swVersion = 'v1.0.0',
    deviceId = 'Emulated Device',
    sparkPlugClient,
    publishPeriod = 5000,
    // Generates a random integer
    randomInt = function () {
      return 1 + Math.floor(Math.random() * 10)
    },
    // Get BIRTH payload for the edge node
    getNodeBirthPayload = function () {
      return {
        timestamp: new Date().getTime(),
        metrics: [
          {
            name: 'Node Control/Rebirth',
            type: 'boolean',
            value: false,
          },
          {
            name: 'Template1',
            type: 'template',
            value: {
              isDefinition: true,
              metrics: [
                { name: 'myBool', value: false, type: 'boolean' },
                { name: 'myInt', value: 0, type: 'int' },
              ],
              parameters: [
                {
                  name: 'param1',
                  type: 'string',
                  value: 'value1',
                },
              ],
            },
          },
        ],
      }
    },
    // Get BIRTH payload for the device
    getDeviceBirthPayload = function () {
      return {
        timestamp: new Date().getTime(),
        metrics: [
          { name: 'my_boolean', value: Math.random() > 0.5, type: 'boolean' },
          { name: 'my_double', value: Math.random() * 0.123456789, type: 'double' },
          { name: 'my_float', value: Math.random() * 0.123, type: 'float' },
          { name: 'my_int', value: randomInt(), type: 'int' },
          { name: 'my_long', value: randomInt() * 214748364700, type: 'long' },
          { name: 'Inputs/0', value: true, type: 'boolean' },
          { name: 'Inputs/1', value: 0, type: 'int' },
          { name: 'Inputs/2', value: 1.23, type: 'float' },
          { name: 'Outputs/0', value: true, type: 'boolean' },
          { name: 'Outputs/1', value: 0, type: 'int' },
          { name: 'Outputs/2', value: 1.23, type: 'float' },
          { name: 'Properties/hw_version', value: hwVersion, type: 'string' },
          { name: 'Properties/sw_version', value: swVersion, type: 'string' },
          {
            name: 'my_dataset',
            type: 'dataset',
            value: {
              numOfColumns: 2,
              types: ['string', 'string'],
              columns: ['str1', 'str2'],
              rows: [
                ['x', 'a'],
                ['y', 'b'],
              ],
            },
          },
          {
            name: 'TemplateInstance1',
            type: 'template',
            value: {
              templateRef: 'Template1',
              isDefinition: false,
              metrics: [
                { name: 'myBool', value: true, type: 'boolean' },
                { name: 'myInt', value: 100, type: 'int' },
              ],
              parameters: [
                {
                  name: 'param1',
                  type: 'string',
                  value: 'value2',
                },
              ],
            },
          },
        ],
      }
    },
    // Get data payload for the device
    getDataPayload = function () {
      return {
        timestamp: new Date().getTime(),
        metrics: [
          { name: 'my_boolean', value: Math.random() > 0.5, type: 'boolean' },
          { name: 'my_double', value: Math.random() * 0.123456789, type: 'double' },
          { name: 'my_float', value: Math.random() * 0.123, type: 'float' },
          { name: 'my_int', value: randomInt(), type: 'int' },
          { name: 'my_long', value: randomInt() * 214748364700, type: 'long' },
        ],
      }
    },
    // Runs the sample
    run = function () {
      // Create the SparkplugClient
      sparkplugClient = SparkplugClient.newClient(config)

      // Create Incoming Message Handler
      sparkplugClient.on('message', function (topic, payload) {
        console.log(topic, payload)
      })

      // Create 'birth' handler
      sparkplugClient.on('birth', function () {
        // Publish Node BIRTH certificate
        sparkplugClient.publishNodeBirth(getNodeBirthPayload())
        // Publish Device BIRTH certificate
        sparkplugClient.publishDeviceBirth(deviceId, getDeviceBirthPayload())
      })

      // Create node command handler
      sparkplugClient.on('ncmd', function (payload) {
        var timestamp = payload.timestamp,
          metrics = payload.metrics

        if (metrics !== undefined && metrics !== null) {
          for (var i = 0; i < metrics.length; i++) {
            var metric = metrics[i]
            if (metric.name == 'Node Control/Rebirth' && metric.value) {
              console.log("Received 'Rebirth' command")
              // Publish Node BIRTH certificate
              sparkplugClient.publishNodeBirth(getNodeBirthPayload())
              // Publish Device BIRTH certificate
              sparkplugClient.publishDeviceBirth(deviceId, getDeviceBirthPayload())
            }
          }
        }
      })

      // Create device command handler
      sparkplugClient.on('dcmd', function (deviceId, payload) {
        var timestamp = payload.timestamp,
          metrics = payload.metrics,
          inboundMetricMap = {},
          outboundMetric = [],
          outboundPayload

        console.log('Command recevied for device ' + deviceId)

        // Loop over the metrics and store them in a map
        if (metrics !== undefined && metrics !== null) {
          for (var i = 0; i < metrics.length; i++) {
            var metric = metrics[i]
            inboundMetricMap[metric.name] = metric.value
          }
        }
        if (inboundMetricMap['Outputs/0'] !== undefined && inboundMetricMap['Outputs/0'] !== null) {
          console.log('Outputs/0: ' + inboundMetricMap['Outputs/0'])
          outboundMetric.push({ name: 'Inputs/0', value: inboundMetricMap['Outputs/0'], type: 'boolean' })
          outboundMetric.push({ name: 'Outputs/0', value: inboundMetricMap['Outputs/0'], type: 'boolean' })
          console.log('Updated value for Inputs/0 ' + inboundMetricMap['Outputs/0'])
        } else if (inboundMetricMap['Outputs/1'] !== undefined && inboundMetricMap['Outputs/1'] !== null) {
          console.log('Outputs/1: ' + inboundMetricMap['Outputs/1'])
          outboundMetric.push({ name: 'Inputs/1', value: inboundMetricMap['Outputs/1'], type: 'int' })
          outboundMetric.push({ name: 'Outputs/1', value: inboundMetricMap['Outputs/1'], type: 'int' })
          console.log('Updated value for Inputs/1 ' + inboundMetricMap['Outputs/1'])
        } else if (inboundMetricMap['Outputs/2'] !== undefined && inboundMetricMap['Outputs/2'] !== null) {
          console.log('Outputs/2: ' + inboundMetricMap['Outputs/2'])
          outboundMetric.push({ name: 'Inputs/2', value: inboundMetricMap['Outputs/2'], type: 'float' })
          outboundMetric.push({ name: 'Outputs/2', value: inboundMetricMap['Outputs/2'], type: 'float' })
          console.log('Updated value for Inputs/2 ' + inboundMetricMap['Outputs/2'])
        }

        outboundPayload = {
          timestamp: new Date().getTime(),
          metrics: outboundMetric,
        }

        // Publish device data
        sparkplugClient.publishDeviceData(deviceId, outboundPayload)
      })

      for (var i = 1; i < 101; i++) {
        // Set up a device data publish for i*publishPeriod milliseconds from now
        setTimeout(function () {
          // Publish device data
          sparkplugClient.publishDeviceData(deviceId, getDataPayload())

          // End the client connection after the last publish
          if (i === 100) {
            sparkplugClient.stop()
          }
        }, i * publishPeriod)
      }
    }

  return { run: run }
})()

// Run the sample
sample.run()
