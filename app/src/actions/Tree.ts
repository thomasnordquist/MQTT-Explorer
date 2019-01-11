import { ActionTypes, CustomAction } from '../reducers'
import * as q from '../../../backend/src/Model'

export const selectTopic = (topic: q.TreeNode): CustomAction => {
  return {
    selectedTopic: topic,
    type: ActionTypes.selectTopic,
  }
}
