import { combineReducers } from 'redux'
import { connectionManagerReducer, ConnectionManagerState } from './ConnectionManager'
import { connectionReducer, ConnectionState } from './Connection'
import { GlobalState, globalState } from './Global'
import { publishReducer, PublishState } from './Publish'
import { Record } from 'immutable'
import { settingsReducer, SettingsState } from './Settings'
import { treeReducer, TreeState } from './Tree'

export interface AppState {
  globalState: GlobalState
  tree: TreeState
  settings: Record<SettingsState>,
  publish: PublishState
  connection: ConnectionState
  connectionManager: ConnectionManagerState
}

export default combineReducers({
  globalState,
  publish: publishReducer,
  connection: connectionReducer,
  settings: settingsReducer,
  tree: treeReducer,
  connectionManager: connectionManagerReducer,
})
