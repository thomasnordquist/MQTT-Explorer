import { createReducer } from './lib'

export interface PublishState {
  manualTopic?: string
  payload?: string
  retain: boolean
  editorMode: string
  qos: 0 | 1 | 2
}

export type Action = SetPayload | SetTopic | ToggleRetain | SetEditorMode | SetQoS

export enum ActionTypes {
  PUBLISH_SET_TOPIC = 'PUBLISH_SET_TOPIC',
  PUBLISH_SET_PAYLOAD = 'PUBLISH_SET_PAYLOAD',
  PUBLISH_TOGGLE_RETAIN = 'PUBLISH_TOGGLE_RETAIN',
  PUBLISH_SET_EDITOR_MODE = 'PUBLISH_SET_EDITOR_MODE',
  PUBLISH_SET_QOS = 'PUBLISH_SET_QOS',
}

export interface SetPayload {
  type: ActionTypes.PUBLISH_SET_PAYLOAD
  payload?: string
}

export interface SetTopic {
  type: ActionTypes.PUBLISH_SET_TOPIC
  topic?: string
}

export interface SetQoS {
  type: ActionTypes.PUBLISH_SET_QOS
  qos: 0 | 1 | 2
}

export interface SetEditorMode {
  type: ActionTypes.PUBLISH_SET_EDITOR_MODE
  editorMode: string
}

export interface ToggleRetain {
  type: ActionTypes.PUBLISH_TOGGLE_RETAIN
}

const initialState: PublishState = {
  editorMode: 'json',
  retain: false,
  qos: 0,
}

export const publishReducer = createReducer(initialState, {
  PUBLISH_SET_TOPIC: setTopic,
  PUBLISH_SET_PAYLOAD: setPayload,
  PUBLISH_TOGGLE_RETAIN: toggleRetain,
  PUBLISH_SET_EDITOR_MODE: setEditorMode,
  PUBLISH_SET_QOS: setQoS,
})

function setTopic(state: PublishState, action: SetTopic) {
  return {
    ...state,
    manualTopic: action.topic,
  }
}

function setPayload(state: PublishState, action: SetPayload) {
  return {
    ...state,
    payload: action.payload,
  }
}

function setQoS(state: PublishState, action: SetQoS) {
  return {
    ...state,
    qos: action.qos,
  }
}

function setEditorMode(state: PublishState, action: SetEditorMode) {
  return {
    ...state,
    editorMode: action.editorMode,
  }
}

function toggleRetain(state: PublishState) {
  return {
    ...state,
    retain: !state.retain,
  }
}
