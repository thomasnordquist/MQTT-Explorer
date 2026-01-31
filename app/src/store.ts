// Export store singleton for use in other modules
import { thunk as reduxThunk } from 'redux-thunk'
import { applyMiddleware, compose, createStore } from 'redux'
import { batchDispatchMiddleware } from 'redux-batched-actions'
import reducers from './reducers'

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(reducers, composeEnhancers(applyMiddleware(reduxThunk, batchDispatchMiddleware)))
