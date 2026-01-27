import { Dispatch } from 'redux'
import { makeOpenDialogRpc } from '../../../events/OpenDialogRequest'
import { Base64 } from 'js-base64'
import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Action, ActionTypes } from '../reducers/Publish'
import { AppState } from '../reducers'
import { MqttMessage, makePublishEvent, rendererEvents, rendererRpc, readFromFile } from '../eventBus'
import { showError } from './Global'

export const setTopic = (topic?: string): Action => ({
  topic,
  type: ActionTypes.PUBLISH_SET_TOPIC,
})

export const openFile =
  (encoding: BufferEncoding = 'utf8') =>
  async (dispatch: Dispatch<any>, getState: () => AppState) => {
    try {
      const file = await getFileContent(encoding)
      if (file) {
        dispatch(setPayload(file.data))
      }
    } catch (error) {
      dispatch(showError(error))
    }
  }

type FileParameters = {
  name: string
  data: string
}
async function getFileContent(encoding: BufferEncoding): Promise<FileParameters | undefined> {
  const rejectReasons = {
    noFileSelected: 'No file selected',
    errorReadingFile: 'Error reading file',
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
    const data = await rendererRpc.call(readFromFile, { filePath: selectedFile, encoding })
    return { name: selectedFile, data: data.toString(encoding) }
  } catch (error) {
    throw rejectReasons.errorReadingFile
  }
}

export const setPayload = (payload?: string): Action => ({
  payload,
  type: ActionTypes.PUBLISH_SET_PAYLOAD,
})

export const setQoS = (qos: 0 | 1 | 2): Action => ({
  qos,
  type: ActionTypes.PUBLISH_SET_QOS,
})

export const setEditorMode = (editorMode: string): Action => ({
  editorMode,
  type: ActionTypes.PUBLISH_SET_EDITOR_MODE,
})

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

export const toggleRetain = (): Action => ({
  type: ActionTypes.PUBLISH_TOGGLE_RETAIN,
})
