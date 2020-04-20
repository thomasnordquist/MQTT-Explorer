import { Base64Message } from './Base64Message'
import { QoS } from '../DataSource/MqttSource'

export interface Message {
  // mqtt based info
  payload: Base64Message | null
  messageId?: number
  retain: boolean
  qos: QoS

  // meta info
  length: number
  received: Date

  // Global message counter, not mqtt related
  messageNumber: number
}
