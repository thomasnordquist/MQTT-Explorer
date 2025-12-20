import { Base64MessageDTO } from '../backend/src/Model/Base64Message'
import { DataSourceState, MqttOptions } from '../backend/src/DataSource'
import { UpdateInfo } from 'builder-util-runtime'
import { RpcEvent } from './EventSystem/Rpc'

export type Event<MessageType> = {
  topic: string
}

export interface AddMqttConnection {
  id: string
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

export const updateAvailable: Event<UpdateInfo> = {
  topic: 'app/update/available',
}

export interface MqttMessage {
  topic: string
  payload: Base64MessageDTO | null
  qos: 0 | 1 | 2
  retain: boolean
  // Set if QoS is > 0 on received messages
  messageId: number | undefined
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

export const getAppVersion: RpcEvent<void, string> = {
  topic: 'getAppVersion',
}

export const writeToFile: RpcEvent<{ filePath: string; data: string; encoding?: string }, void> = {
  topic: 'writeFile',
}

export const readFromFile: RpcEvent<{ filePath: string; encoding?: string }, Buffer> = {
  topic: 'readFromFile',
}

export const MAX_MESSAGE_SIZE_20KB = 20000
export const MAX_MESSAGE_SIZE_100KB = 100000
export const MAX_MESSAGE_SIZE_1MB = 1000000
export const MAX_MESSAGE_SIZE_5MB = 5000000
export const MAX_MESSAGE_SIZE_UNLIMITED = -1
export const MAX_MESSAGE_SIZE_DEFAULT = MAX_MESSAGE_SIZE_20KB

export const setMaxMessageSize: Event<number> = {
  topic: 'settings/maxMessageSize',
}

