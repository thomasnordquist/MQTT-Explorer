import { DataSourceState, MqttOptions } from '../backend/src/DataSource'

import { UpdateInfo } from 'builder-util-runtime'

export { UpdateInfo } from 'builder-util-runtime'

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

export const checkForUpdates: Event<void> = {
  topic: 'app/update/check',
}

export const updateAvailable: Event<UpdateInfo> = {
  topic: 'app/update/available',
}

export interface Message {
  topic: string,
  payload: any
}

export function makePublishEvent(connectionId: string): Event<Message> {
  return {
    topic: `conn/publish/${connectionId}`,
  }
}

export function makeConnectionMessageEvent(connectionId: string): Event<Message> {
  return {
    topic: `conn/${connectionId}`,
  }
}
