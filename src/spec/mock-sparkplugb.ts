/** ******************************************************************************
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
 ******************************************************************************* */
import * as SparkplugClient from 'sparkplug-client'
import type { UPayload } from 'sparkplug-client'
import type { UMetric } from 'sparkplug-payload/lib/sparkplugbpayload'

/*
 * Main sample function which includes the run() function for running the sample
 */

export interface MockSparkplugClient {
  stop: () => void
}

const sample = (function () {
  const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
  const brokerPort = process.env.TESTS_MQTT_BROKER_PORT || '1883'
  const config = {
    serverUrl: `tcp://${brokerHost}:${brokerPort}`,
    username: '',
    password: '',
    groupId: 'Sparkplug Devices',
    edgeNode: 'JavaScript Edge Node',
    clientId: 'JavaScriptSimpleEdgeNode',
    version: 'spBv1.0',
  }
  const hwVersion = 'Emulated Hardware'
  const swVersion = 'v1.0.0'
  const deviceId = 'Emulated Device'
  let sparkPlugClient
  const publishPeriod = 5000
  // Generates a random integer
  const randomInt = function () {
    return 1 + Math.floor(Math.random() * 10)
  }
  // Get BIRTH payload for the edge node
  const getNodeBirthPayload = function (): UPayload {
    return {
      timestamp: new Date().getTime(),
      metrics: [
        {
          name: 'Node Control/Rebirth',
          type: 'Boolean',
          value: false,
        },
        {
          name: 'Template1',
          type: 'Template',
          value: {
            isDefinition: true,
            metrics: [
              { name: 'myBool', value: false, type: 'Boolean' },
              { name: 'myInt', value: 0, type: 'UInt32' },
            ],
            parameters: [
              {
                name: 'param1',
                type: 'String',
                value: 'value1',
              },
            ],
          },
        },
      ],
    }
  }
  // Get BIRTH payload for the device
  const getDeviceBirthPayload = function (): UPayload {
    return {
      timestamp: new Date().getTime(),
      metrics: [
        { name: 'my_boolean', value: Math.random() > 0.5, type: 'Boolean' },
        { name: 'my_double', value: Math.random() * 0.123456789, type: 'Double' },
        { name: 'my_float', value: Math.random() * 0.123, type: 'Float' },
        { name: 'my_int', value: randomInt(), type: 'Int8' },
        { name: 'my_long', value: randomInt() * 214748364700, type: 'Int64' },
        { name: 'Inputs/0', value: true, type: 'Boolean' },
        { name: 'Inputs/1', value: 0, type: 'Int8' },
        { name: 'Inputs/2', value: 1.23, type: 'UInt64' },
        { name: 'Outputs/0', value: true, type: 'Boolean' },
        { name: 'Outputs/1', value: 0, type: 'Int16' },
        { name: 'Outputs/2', value: 1.23, type: 'UInt64' },
        { name: 'Properties/hw_version', value: hwVersion, type: 'String' },
        { name: 'Properties/sw_version', value: swVersion, type: 'String' },
        {
          name: 'my_dataset',
          type: 'DataSet',
          value: {
            numOfColumns: 2,
            types: ['String', 'String'],
            columns: ['str1', 'str2'],
            rows: [
              ['x', 'a'],
              ['y', 'b'],
            ],
          },
        },
        {
          name: 'TemplateInstance1',
          type: 'Template',
          value: {
            templateRef: 'Template1',
            isDefinition: false,
            metrics: [
              { name: 'myBool', value: true, type: 'Boolean' },
              { name: 'myInt', value: 100, type: 'Int8' },
            ],
            parameters: [
              {
                name: 'param1',
                type: 'String',
                value: 'value2',
              },
            ],
          },
        },
      ],
    }
  }
  // Get data payload for the device
  const getDataPayload = function (): UPayload {
    return {
      timestamp: new Date().getTime(),
      metrics: [
        { name: 'my_boolean', value: Math.random() > 0.5, type: 'Boolean' },
        { name: 'my_double', value: Math.random() * 0.123456789, type: 'Double' },
        { name: 'my_float', value: Math.random() * 0.123, type: 'UInt64' },
        { name: 'my_int', value: randomInt(), type: 'Int16' },
        { name: 'my_long', value: randomInt() * 214748364700, type: 'UInt64' },
      ],
    }
  }
  // Runs the sample
  const run = async function (): Promise<MockSparkplugClient> {
    // Create the SparkplugClient
    const sparkplugClient = SparkplugClient.newClient(config)
    let updateInterval: NodeJS.Timeout | null = null
    const connected = new Promise<MockSparkplugClient>(resolve => {
      // Create 'birth' handler
      sparkplugClient.on('birth', () => {
        // Publish Node BIRTH certificate
        sparkplugClient.publishNodeBirth(getNodeBirthPayload())
        // Publish Device BIRTH certificate
        sparkplugClient.publishDeviceBirth(deviceId, getDeviceBirthPayload())
        resolve({
          stop: () => {
            if (updateInterval) {
              clearInterval(updateInterval)
            }
            sparkplugClient.stop()
          },
        })
      })
    })

    // Create Incoming Message Handler
    sparkplugClient.on('message', (topic: string, payload: UPayload) => {
      console.log(topic, payload)
    })

    // Create node command handler
    // spell-checker: disable-next-line
    sparkplugClient.on('ncmd', (payload: UPayload) => {
      const { timestamp } = payload
      const { metrics } = payload

      if (metrics !== undefined && metrics !== null) {
        for (let i = 0; i < metrics.length; i++) {
          const metric = metrics[i]
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
    // spell-checker: disable-next-line
    sparkplugClient.on('dcmd', (deviceId: string, payload: UPayload) => {
      const { timestamp } = payload
      const { metrics } = payload
      const inboundMetricMap: { [name: string]: any } = {}
      const outboundMetric: Array<UMetric> = []
      let outboundPayload: UPayload

      console.log(`Command received for device ${deviceId}`)

      // Loop over the metrics and store them in a map
      if (metrics !== undefined && metrics !== null) {
        for (let i = 0; i < metrics.length; i++) {
          const metric = metrics[i]
          if (metric.name !== undefined && metric.name !== null) {
            inboundMetricMap[metric.name] = metric.value
          }
        }
      }
      if (inboundMetricMap['Outputs/0'] !== undefined && inboundMetricMap['Outputs/0'] !== null) {
        console.log(`Outputs/0: ${inboundMetricMap['Outputs/0']}`)
        outboundMetric.push({ name: 'Inputs/0', value: inboundMetricMap['Outputs/0'], type: 'Boolean' })
        outboundMetric.push({ name: 'Outputs/0', value: inboundMetricMap['Outputs/0'], type: 'Boolean' })
        console.log(`Updated value for Inputs/0 ${inboundMetricMap['Outputs/0']}`)
      } else if (inboundMetricMap['Outputs/1'] !== undefined && inboundMetricMap['Outputs/1'] !== null) {
        console.log(`Outputs/1: ${inboundMetricMap['Outputs/1']}`)
        outboundMetric.push({ name: 'Inputs/1', value: inboundMetricMap['Outputs/1'], type: 'Int32' })
        outboundMetric.push({ name: 'Outputs/1', value: inboundMetricMap['Outputs/1'], type: 'Int32' })
        console.log(`Updated value for Inputs/1 ${inboundMetricMap['Outputs/1']}`)
      } else if (inboundMetricMap['Outputs/2'] !== undefined && inboundMetricMap['Outputs/2'] !== null) {
        console.log(`Outputs/2: ${inboundMetricMap['Outputs/2']}`)
        outboundMetric.push({ name: 'Inputs/2', value: inboundMetricMap['Outputs/2'], type: 'UInt64' })
        outboundMetric.push({ name: 'Outputs/2', value: inboundMetricMap['Outputs/2'], type: 'UInt64' })
        console.log(`Updated value for Inputs/2 ${inboundMetricMap['Outputs/2']}`)
      }

      outboundPayload = {
        timestamp: new Date().getTime(),
        metrics: outboundMetric,
      }

      // Publish device data
      sparkplugClient.publishDeviceData(deviceId, outboundPayload)
    })

    updateInterval = setInterval(() => {
      // Publish device data
      sparkplugClient.publishDeviceData(deviceId, getDataPayload())
    }, 2000)
    return connected
  }

  return { run }
})()

export default sample
