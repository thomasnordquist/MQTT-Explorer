import { Action, ActionTypes } from '../reducers/Publish'
import { AppState } from '../reducers'
import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Dispatch } from 'redux'
import { promises as fsPromise } from 'fs'
import { MqttMessage, makePublishEvent, rendererEvents, rendererRpc } from '../../../events'
import { makeOpenDialogRpc } from '../../../events/OpenDialogRequest'
import { showError } from './Global'

export const setTopic = (topic?: string): Action => {
  return {
    topic,
    type: ActionTypes.PUBLISH_SET_TOPIC,
  }
}

export const openFile = () => async (dispatch: Dispatch<any>, getState: () => AppState) => {
  try {
    const file = await getFileContent()
    if (file) {
      dispatch(
        setPayload(Base64Message.fromBuffer(file.data).toUnicodeString()
        ))
    }
  } catch (error) {
    dispatch(showError(error))
  }
}

type FileParameters = {
  name: string,
  data: Buffer
}
async function getFileContent(): Promise<FileParameters | undefined> {
  const rejectReasons = {
    noFileSelected: 'No file selected',
    errorReadingFile: 'Error reading file'
  }

  const { canceled, filePaths } = await rendererRpc.call(makeOpenDialogRpc(), {
    properties: ['openFile'],
    securityScopedBookmarks: true,
  })

  if (canceled) {
    return
  }

  const selectedFile = filePaths[0]
  if (!selectedFile) {
    throw rejectReasons.noFileSelected
  }
  try {
    const data = await fsPromise.readFile(selectedFile)
    return { name: selectedFile, data }
  } catch (error) {
    throw rejectReasons.errorReadingFile
  }
}

export const setPayload = (payload?: string): Action => {
  return {
    payload,
    type: ActionTypes.PUBLISH_SET_PAYLOAD,
  }
}

export const setQoS = (qos: 0 | 1 | 2): Action => {
  return {
    qos,
    type: ActionTypes.PUBLISH_SET_QOS,
  }
}

export const setEditorMode = (editorMode: string): Action => {
  return {
    editorMode,
    type: ActionTypes.PUBLISH_SET_EDITOR_MODE,
  }
}

export const publish = (connectionId: string) => (dispatch: Dispatch<Action>, getState: () => AppState) => {
  const state = getState()
  const topic = state.publish.manualTopic ?? state.tree.get('selectedTopic')?.path()

  if (!topic) {
    return
  }

  const publishEvent = makePublishEvent(connectionId)
  const mqttMessage: Partial<MqttMessage> = {
    topic,
    payload: state.publish.payload ? Base64Message.fromString(state.publish.payload) : null,
    retain: state.publish.retain,
    qos: state.publish.qos,
  }
  rendererEvents.emit(publishEvent, mqttMessage)
}

export const toggleRetain = (): Action => {
  return {
    type: ActionTypes.PUBLISH_TOGGLE_RETAIN,
  }
}
