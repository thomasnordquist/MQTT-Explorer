/**
 * Simplified Event System V2
 *
 * This provides a simpler, more type-safe way to define and use events.
 * Instead of factory functions like makeConnectionStateEvent(id),
 * you can now use: Events.connectionState(id)
 */

import { Base64MessageDTO } from '../backend/src/Model/Base64Message'
import { DataSourceState, MqttOptions } from '../backend/src/DataSource'
import { UpdateInfo } from 'builder-util-runtime'
import { RpcEvent } from './EventSystem/Rpc'

export type EventV2<MessageType> = {
  topic: string
}

// Simple event definitions (no parameters)
export const Events = {
  // Connection management
  addMqttConnection: { topic: 'connection/add/mqtt' } as EventV2<AddMqttConnectionV2>,
  removeConnection: { topic: 'connection/remove' } as EventV2<string>,
  updateAvailable: { topic: 'app/update/available' } as EventV2<UpdateInfo>,

  // Settings
  setMaxMessageSize: { topic: 'settings/maxMessageSize' } as EventV2<number>,

  // Parameterized events (for connection-specific events)
  connectionState: (connectionId: string) => ({ topic: `conn/state/${connectionId}` }) as EventV2<DataSourceState>,
  connectionMessage: (connectionId: string) => ({ topic: `conn/${connectionId}` }) as EventV2<MqttMessageV2>,
  publish: (connectionId: string) => ({ topic: `conn/publish/${connectionId}` }) as EventV2<MqttMessageV2>,
}

// RPC Events - type-safe request/response patterns
export const RpcEvents = {
  getAppVersion: { topic: 'getAppVersion' } as RpcEvent<void, string>,
  writeToFile: { topic: 'writeFile' } as RpcEvent<{ filePath: string; data: string; encoding?: string }, void>,
  readFromFile: { topic: 'readFromFile' } as RpcEvent<{ filePath: string; encoding?: string }, Buffer>,
  openDialog: { topic: 'openDialog' } as RpcEvent<OpenDialogOptionsV2, OpenDialogReturnValueV2>,
  saveDialog: { topic: 'saveDialog' } as RpcEvent<SaveDialogOptionsV2, SaveDialogReturnValueV2>,
  uploadCertificate: { topic: 'uploadCertificate' } as RpcEvent<CertificateUploadRequest, CertificateUploadResponse>,
}

// Type definitions
export interface AddMqttConnectionV2 {
  id: string
  options: MqttOptions
}

export interface MqttMessageV2 {
  topic: string
  payload: Base64MessageDTO | null
  qos: 0 | 1 | 2
  retain: boolean
  messageId: number | undefined
}

export interface CertificateUploadRequest {
  filename: string
  data: string // base64 encoded
}

export interface CertificateUploadResponse {
  name: string
  data: string // base64 encoded
}

// Message size constants
export const MAX_MESSAGE_SIZE_20KB = 20000
export const MAX_MESSAGE_SIZE_100KB = 100000
export const MAX_MESSAGE_SIZE_1MB = 1000000
export const MAX_MESSAGE_SIZE_5MB = 5000000
export const MAX_MESSAGE_SIZE_UNLIMITED = -1
export const MAX_MESSAGE_SIZE_DEFAULT = MAX_MESSAGE_SIZE_20KB

// Electron dialog types (re-exported for convenience)
import { OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron'

export type OpenDialogOptionsV2 = OpenDialogOptions
export type OpenDialogReturnValueV2 = OpenDialogReturnValue
export type SaveDialogOptionsV2 = SaveDialogOptions
export type SaveDialogReturnValueV2 = SaveDialogReturnValue
