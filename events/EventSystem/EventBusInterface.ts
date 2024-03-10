import { Event } from '../Events'

export interface EventBusInterface {
  subscribe<MessageType>(event: Event<MessageType>, callback: (msg: MessageType) => void): void
  unsubscribeAll<MessageType>(event: Event<MessageType>): void
  emit<MessageType>(event: Event<MessageType>, msg: MessageType): void
  unsubscribe<MessageType>(event: Event<MessageType>, callback: any): void
}
