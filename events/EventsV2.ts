/**
 * Simplified Event System V2
 *
 * This provides a simpler, more type-safe way to define and use events.
 * Instead of factory functions like makeConnectionStateEvent(id),
 * you can now use: Events.connectionState(id)
 */

import { UpdateInfo } from 'builder-util-runtime'
import { Base64MessageDTO } from '../backend/src/Model/Base64Message'
import { DataSourceState, MqttOptions } from '../backend/src/DataSource'
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
  llmChat: { topic: 'llm/chat' } as RpcEvent<LlmChatRequest, LlmChatResponse>,
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

// LLM Chat RPC types
export interface LlmChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  topicContext?: string
  toolResults?: Array<{
    tool_call_id: string
    name: string
    content: string
  }>
}

export interface LlmToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface LlmChatResponse {
  response: string
  toolCalls?: LlmToolCall[]
}

// Dialog types (browser-compatible versions)
import type { OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from './DialogTypes'

export type OpenDialogOptionsV2 = OpenDialogOptions
export type OpenDialogReturnValueV2 = OpenDialogReturnValue
export type SaveDialogOptionsV2 = SaveDialogOptions
export type SaveDialogReturnValueV2 = SaveDialogReturnValue
