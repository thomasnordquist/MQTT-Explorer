import { ActionTypes, NodeOrder } from '../reducers'

export const setAutoExpandLimit = (autoExpandLimit: number = 0) => {
  return {
    autoExpandLimit,
    type: ActionTypes.setAutoExpandLimit,
  }
}

export const toggleSettingsVisibility = () => {
  return {
    type: ActionTypes.toggleSettingsVisibility,
  }
}

export const setNodeOrder = (nodeOrder: NodeOrder = NodeOrder.none) => {
  return {
    nodeOrder,
    type: ActionTypes.setNodeOrder,
  }
}
