import { DataSourceState, MqttOptions } from '../backend/src/DataSource'

import { UpdateInfo } from 'builder-util-runtime'
import { Base64Message } from '../backend/src/Model/Base64Message'

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

export interface MqttMessage {
  topic: string,
  payload: Base64Message | null,
  qos: 0 | 1 | 2,
  retain: boolean
}

export function makePublishEvent(connectionId: string): Event<MqttMessage> {
  return {
    topic: `conn/publish/${connectionId}`,
  }
}

export function makeConnectionMessageEvent(connectionId: string): Event<MqttMessage> {
  return {
    topic: `conn/${connectionId}`,
  }
}
