import * as q from '../../../backend/src/Model'
import { Action } from 'redux'
import { createReducer } from './lib'
import { TopicViewModel } from '../model/TopicViewModel'

export interface TreeState {
  tree?: q.Tree<TopicViewModel>
  selectedTopic?: q.TreeNode<TopicViewModel>
  filter?: string
  paused: boolean
}

export type Action = ShowTree | SelectTopic

export enum ActionTypes {
  TREE_SHOW_TREE = 'TREE_SHOW_TREE',
  TREE_SELECT_TOPIC = 'TREE_SELECT_TOPIC',
  TREE_RESUME_UPDATES = 'TREE_RESUME_UPDATES',
  TREE_PAUSE_UPDATES = 'TREE_PAUSE_UPDATES',
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

const initialState: TreeState = {
  paused: false,
}

const setPaused = (pause: boolean) => (state: TreeState, action: ShowTree) => {
  return {
    ...state,
    paused: pause,
  }
}

export const treeReducer = createReducer(initialState, {
  TREE_SHOW_TREE: showTree,
  TREE_SELECT_TOPIC: selectTopic,
  TREE_PAUSE_UPDATES: setPaused(true),
  TREE_RESUME_UPDATES: setPaused(false),
})

function showTree(state: TreeState, action: ShowTree) {
  return {
    ...state,
    tree: action.tree,
    filter: action.filter,
  }
}

function selectTopic(state: TreeState, action: SelectTopic) {
  return {
    ...state,
    selectedTopic: action.selectedTopic,
  }
}
