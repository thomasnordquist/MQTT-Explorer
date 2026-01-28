export const createReducer =
  (initialState: any, handlers: any) =>
  (state = initialState, action: any) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    }
    return state
  }
