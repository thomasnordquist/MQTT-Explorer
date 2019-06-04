import { Message } from './Message'
import { RingBuffer } from './RingBuffer'

export type MessageHistory = RingBuffer<Message>
