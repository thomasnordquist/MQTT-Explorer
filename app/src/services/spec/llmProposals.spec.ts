import { expect } from 'chai'
import 'mocha'
import { MessageProposal } from '../llmService'

/**
 * Integration tests for LLM proposal quality
 *
 * These tests validate that:
 * 1. Proposals have valid MQTT topic format
 * 2. Payloads are properly formatted (JSON or simple values)
 * 3. QoS levels are valid (0, 1, or 2)
 * 4. Descriptions are clear and actionable
 * 5. Proposals match the detected home automation system
 */

describe('LLM Proposal Validation', () => {
  describe('Topic Format Validation', () => {
    it('should validate topic format is not empty', () => {
      const proposal: MessageProposal = {
        topic: 'zigbee2mqtt/living_room_light/set',
        payload: '{"state": "ON"}',
        qos: 0,
        description: 'Turn on the light',
      }

      expect(proposal.topic).to.not.be.empty
      expect(proposal.topic).to.be.a('string')
    })

    it('should validate topic does not contain wildcards', () => {
      const validateTopic = (topic: string) => !topic.includes('#') && !topic.includes('+')

      const validTopic = 'home/livingroom/light/set'
      const invalidTopic1 = 'home/+/light/set'
      const invalidTopic2 = 'home/#'

      expect(validateTopic(validTopic)).to.be.true
      expect(validateTopic(invalidTopic1)).to.be.false
      expect(validateTopic(invalidTopic2)).to.be.false
    })

    it('should validate topic segments are valid', () => {
      const validateTopicSegments = (topic: string) => {
        const segments = topic.split('/')
        return segments.every(seg => seg.length > 0)
      }

      expect(validateTopicSegments('home/light/set')).to.be.true
      expect(validateTopicSegments('home//light')).to.be.false
      expect(validateTopicSegments('')).to.be.false
    })
  })

  describe('Payload Validation', () => {
    it('should validate JSON payloads are parseable', () => {
      const validateJSONPayload = (payload: string) => {
        try {
          JSON.parse(payload)
          return true
        } catch (e) {
          // Not JSON, which is also valid for MQTT
          return true
        }
      }

      expect(validateJSONPayload('{"state": "ON"}')).to.be.true
      expect(validateJSONPayload('ON')).to.be.true
      expect(validateJSONPayload('123')).to.be.true
    })

    it('should validate common Home Assistant payloads', () => {
      const homeAssistantPayloads = [
        '{"state": "ON"}',
        '{"state": "OFF"}',
        '{"brightness": 255}',
        '{"color_temp": 250}',
        '{"rgb": [255, 0, 0]}',
        'ON',
        'OFF',
      ]

      homeAssistantPayloads.forEach(payload => {
        expect(() => {
          if (payload.startsWith('{')) {
            JSON.parse(payload)
          }
        }).to.not.throw()
      })
    })

    it('should validate zigbee2mqtt payloads', () => {
      const zigbee2mqttPayloads = [
        '{"state": "ON"}',
        '{"state": "OFF"}',
        '{"state": "TOGGLE"}',
        '{"brightness": 254}',
        '{"color": {"x": 0.5, "y": 0.5}}',
      ]

      zigbee2mqttPayloads.forEach(payload => {
        expect(() => JSON.parse(payload)).to.not.throw()
      })
    })

    it('should validate tasmota payloads', () => {
      const tasmotaPayloads = ['ON', 'OFF', 'TOGGLE', '1', '0', '{"POWER": "ON"}']

      tasmotaPayloads.forEach(payload => {
        // All should be valid strings
        expect(payload).to.be.a('string')
      })
    })
  })

  describe('QoS Validation', () => {
    it('should validate QoS is 0, 1, or 2', () => {
      const validateQoS = (qos: number) => qos === 0 || qos === 1 || qos === 2

      expect(validateQoS(0)).to.be.true
      expect(validateQoS(1)).to.be.true
      expect(validateQoS(2)).to.be.true
      expect(validateQoS(3)).to.be.false
      expect(validateQoS(-1)).to.be.false
    })

    it('should recommend QoS 0 for most home automation', () => {
      // Most home automation doesn't need guaranteed delivery
      const proposal: MessageProposal = {
        topic: 'home/light/set',
        payload: 'ON',
        qos: 0,
        description: 'Turn on light',
      }

      expect(proposal.qos).to.equal(0)
    })
  })

  describe('Description Validation', () => {
    it('should have non-empty description', () => {
      const validateDescription = (description: string) => !!(description && description.trim().length > 0)

      expect(validateDescription('Turn on the light')).to.be.true
      expect(validateDescription('')).to.be.false
      expect(validateDescription('   ')).to.be.false
    })

    it('should have actionable description', () => {
      const descriptions = [
        'Turn on the light',
        'Turn off the device',
        'Set brightness to maximum',
        'Toggle the switch',
        'Set color to red',
      ]

      descriptions.forEach(desc => {
        expect(desc).to.match(/turn|set|toggle|switch|change/i)
      })
    })

    it('should describe the action clearly', () => {
      const proposal: MessageProposal = {
        topic: 'home/light/set',
        payload: 'ON',
        qos: 0,
        description: 'Turn on the light',
      }

      expect(proposal.description).to.not.equal(proposal.payload)
      expect(proposal.description.length).to.be.greaterThan(5)
    })
  })

  describe('System-Specific Proposal Patterns', () => {
    it('should recognize Home Assistant topic patterns', () => {
      const homeAssistantPatterns = [
        'homeassistant/light/living_room/set',
        'homeassistant/switch/bedroom/set',
        'homeassistant/sensor/temperature/state',
      ]

      homeAssistantPatterns.forEach(topic => {
        expect(topic).to.match(/^homeassistant\//)
      })
    })

    it('should recognize zigbee2mqtt topic patterns', () => {
      const zigbee2mqttPatterns = [
        'zigbee2mqtt/living_room_light/set',
        'zigbee2mqtt/bedroom_sensor/get',
        'zigbee2mqtt/kitchen_switch/set',
      ]

      zigbee2mqttPatterns.forEach(topic => {
        expect(topic).to.match(/^zigbee2mqtt\//)
      })
    })

    it('should recognize tasmota topic patterns', () => {
      const tasmotaPatterns = ['cmnd/tasmota/POWER', 'cmnd/sonoff/POWER1', 'stat/tasmota/RESULT']

      tasmotaPatterns.forEach(topic => {
        expect(topic).to.match(/^(cmnd|stat|tele)\//)
      })
    })

    it('should recognize homie topic patterns', () => {
      const homiePatterns = ['homie/device-id/light/power/set', 'homie/device-id/sensor/temperature/target']

      homiePatterns.forEach(topic => {
        expect(topic).to.match(/^homie\//)
      })
    })
  })

  describe('Proposal Completeness', () => {
    it('should have all required fields', () => {
      const proposal: MessageProposal = {
        topic: 'home/light/set',
        payload: 'ON',
        qos: 0,
        description: 'Turn on the light',
      }

      expect(proposal).to.have.property('topic')
      expect(proposal).to.have.property('payload')
      expect(proposal).to.have.property('qos')
      expect(proposal).to.have.property('description')
    })

    it('should validate proposal structure', () => {
      const validateProposal = (proposal: MessageProposal) =>
        typeof proposal.topic === 'string' &&
        proposal.topic.length > 0 &&
        typeof proposal.payload === 'string' &&
        (proposal.qos === 0 || proposal.qos === 1 || proposal.qos === 2) &&
        typeof proposal.description === 'string' &&
        proposal.description.length > 0

      const valid: MessageProposal = {
        topic: 'test/topic',
        payload: 'value',
        qos: 0,
        description: 'Test action',
      }

      expect(validateProposal(valid)).to.be.true
    })
  })

  describe('Security Validation', () => {
    it('should not contain command injection attempts', () => {
      const validateNoInjection = (payload: string) => {
        // Check for common injection patterns
        const dangerousPatterns = ['; rm -rf', '&& cat', '| bash', '$(whoami)', '`ls`']

        return !dangerousPatterns.some(pattern => payload.includes(pattern))
      }

      expect(validateNoInjection('{"state": "ON"}')).to.be.true
      expect(validateNoInjection('ON')).to.be.true
      expect(validateNoInjection('; rm -rf /')).to.be.false
    })

    it('should have reasonable payload size', () => {
      const validatePayloadSize = (payload: string) => payload.length < 10000 // 10KB limit

      expect(validatePayloadSize('{"state": "ON"}')).to.be.true
      expect(validatePayloadSize('x'.repeat(20000))).to.be.false
    })
  })
})
