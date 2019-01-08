import { MqttOptions, DataSourceState } from '../backend/src/DataSource'

export interface Event<MessageType> {
  topic: string
}

export interface AddMqttConnection {
  id: string,
  options: MqttOptions
}

export const addMqttConnectionEvent: Event<AddMqttConnection> = {
  topic: 'connection/add/mqtt',
}

export const removeConnection: Event<string> = {
  topic: 'connection/remove',
}

export function makeConnectionStateEvent(connectionId: string): Event<DataSourceState> {
  return {
    topic: `conn/state/${connectionId}`,
  }
}

interface Message {
  topic: string,
  payload: any
}

export function makeConnectionMessageEvent(connectionId: string): Event<Message> {
  return {
    topic: `conn/${connectionId}`,
  }
}
