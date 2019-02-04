import { ActionTypes } from '../reducers/ConnectionManager'
import { Dispatch } from 'redux'
import { AppState } from '../reducers'
import { ConnnectionOptions } from '../model/ConnectionOptions'
import { default as persistantStorage, StorageIdentifier } from '../PersistantStorage'

export const storedConnectionsIdentifier: StorageIdentifier<ConnnectionOptions[]> = {
  id: 'connections',
}

export const loadConnectionSettings = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const connections = persistantStorage.load(storedConnectionsIdentifier)
  if (!connections) {
    return
  }
  dispatch(setConnections(connections))
}

export const setConnections = (connections: ConnnectionOptions[])  => ({
  connections,
  type: ActionTypes.CONNECTION_MANAGER_SET_CONNECTIONS,
})
