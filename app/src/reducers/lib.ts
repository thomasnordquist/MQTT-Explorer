export const createReducer = (initialState: any, handlers: any) => {
  return (state = initialState, action: any) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}
