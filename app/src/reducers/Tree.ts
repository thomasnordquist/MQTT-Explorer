import { Action as ReduxAction } from 'redux'
import { Record } from 'immutable'
import * as q from '../../../backend/src/Model'
import { createReducer } from './lib'
import { TopicViewModel } from '../model/TopicViewModel'

interface TreeStateModel {
  tree?: q.Tree<TopicViewModel>
  selectedTopic?: q.TreeNode<TopicViewModel>
  filter?: string
  paused: boolean
}

export type TreeState = Record<TreeStateModel>

export type Action = ShowTree | SelectTopic | ResetStore

export enum ActionTypes {
  TREE_SHOW_TREE = 'TREE_SHOW_TREE',
  TREE_SELECT_TOPIC = 'TREE_SELECT_TOPIC',
  TREE_RESUME_UPDATES = 'TREE_RESUME_UPDATES',
  TREE_PAUSE_UPDATES = 'TREE_PAUSE_UPDATES',
  TREE_RESET_STORE = 'TREE_RESET_STORE',
}

export interface ShowTree {
  type: ActionTypes.TREE_SHOW_TREE
  tree?: q.Tree<TopicViewModel>
  filter?: string
}

export interface SelectTopic {
  type: ActionTypes.TREE_SELECT_TOPIC
  selectedTopic?: q.TreeNode<TopicViewModel>
}

export interface SetPause {
  type: ActionTypes.TREE_PAUSE_UPDATES | ActionTypes.TREE_RESUME_UPDATES
}

const initialStateFactory = Record<TreeStateModel>({
  paused: false,
  tree: undefined,
  selectedTopic: undefined,
  filter: undefined,
})

const setPaused =
  (pause: boolean) =>
  (state: TreeState, action: ShowTree): TreeState =>
    state.set('paused', pause)

const actions: {
  [s: string]: any
} = {
  TREE_SHOW_TREE: showTree,
  TREE_SELECT_TOPIC: selectTopic,
  TREE_PAUSE_UPDATES: setPaused(true),
  TREE_RESUME_UPDATES: setPaused(false),
  TREE_RESET_STORE: resetStore,
}

export const treeReducer = createReducer(initialStateFactory(), actions)

function showTree(state: TreeState, action: ShowTree): TreeState {
  return state.merge({
    tree: action.tree,
    filter: action.filter,
  })
}

function selectTopic(state: TreeState, action: SelectTopic): TreeState {
  return state.set('selectedTopic', action.selectedTopic)
}

export interface ResetStore {
  type: ActionTypes.TREE_RESET_STORE
}

function resetStore(state: TreeState, action: ResetStore): TreeState {
  return initialStateFactory()
}
