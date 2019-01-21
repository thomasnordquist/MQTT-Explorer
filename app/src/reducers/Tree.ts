import * as q from '../../../backend/src/Model'
import { Action } from 'redux'
import { createReducer } from './lib'

export interface TreeState {
  tree?: q.Tree
  selectedTopic?: q.TreeNode
  filter?: string
}

export type Action = ShowTree | SelectTopic

export enum ActionTypes {
  TREE_SHOW_TREE = 'TREE_SHOW_TREE',
  TREE_SELECT_TOPIC = 'TREE_SELECT_TOPIC',
}

export interface ShowTree {
  type: ActionTypes.TREE_SHOW_TREE
  tree?: q.Tree
  filter?: string
}

export interface SelectTopic {
  type: ActionTypes.TREE_SELECT_TOPIC
  selectedTopic?: q.TreeNode
}

const initialState: TreeState = { }

export const treeReducer = createReducer(initialState, {
  TREE_SHOW_TREE: showTree,
  TREE_SELECT_TOPIC: selectTopic,
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
