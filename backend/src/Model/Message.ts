import { Base64Message } from './Base64Message'

export interface Message {
  value?: Base64Message
  length: number
  received: Date
}
