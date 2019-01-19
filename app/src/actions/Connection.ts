import { ActionTypes, NodeOrder, CustomAction, AppState } from '../reducers'
import { MqttOptions } from '../../../backend/src/DataSource'
import { Dispatch } from 'redux'
import { rendererEvents, addMqttConnectionEvent, makeConnectionStateEvent, removeConnection } from '../../../events'

export const connect = (options: MqttOptions, connectionId: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  dispatch(connecting(connectionId))
  rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })
  const event = makeConnectionStateEvent(connectionId)
  rendererEvents.subscribe(event, (dataSourceState) => {
    if (dataSourceState.connected) {
      dispatch(connected())
    } else if (dataSourceState.error) {
      dispatch(showError(dataSourceState.error))
      dispatch(disconnect())
    }
  })
}

export const connected: () => CustomAction = ()  => ({
  type: ActionTypes.connected,
})

export const connecting: (connectionId: string) => CustomAction = (connectionId: string)  => ({
  connectionId,
  type: ActionTypes.connecting,
})

export const showError = (error?: string) => ({
  error,
  type: ActionTypes.showError,
})

export const disconnect = () => (dispatch: Dispatch<CustomAction>, getState: () => AppState)  => {
  rendererEvents.emit(removeConnection, getState().connectionId)

  dispatch({
    type: ActionTypes.disconnect,
  })
}
