import { ActionTypes, NodeOrder, CustomAction } from '../reducers'

export const setAutoExpandLimit = (autoExpandLimit: number = 0): CustomAction => {
  return {
    autoExpandLimit,
    type: ActionTypes.setAutoExpandLimit,
  }
}

export const toggleSettingsVisibility = (): CustomAction => {
  return {
    type: ActionTypes.toggleSettingsVisibility,
  }
}

export const setNodeOrder = (nodeOrder: NodeOrder = NodeOrder.none): CustomAction => {
  return {
    nodeOrder,
    type: ActionTypes.setNodeOrder,
  }
}
