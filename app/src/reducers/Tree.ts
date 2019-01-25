import * as q from '../../../backend/src/Model'
import { Action } from 'redux'
import { createReducer } from './lib'
import { TopicViewModel } from '../TopicViewModel'

export interface TreeState {
  tree?: q.Tree<TopicViewModel>
  selectedTopic?: q.TreeNode<TopicViewModel>
  filter?: string
}

export type Action = ShowTree | SelectTopic

export enum ActionTypes {
  TREE_SHOW_TREE = 'TREE_SHOW_TREE',
  TREE_SELECT_TOPIC = 'TREE_SELECT_TOPIC',
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
