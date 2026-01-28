import { Dispatch } from 'redux'
import { Action, ActionTypes, ChartParameters } from '../reducers/Charts'
import { AppState } from '../reducers'
import { default as persistentStorage, StorageIdentifier } from '../utils/PersistentStorage'
import { showError, showNotification } from './Global'

interface ConnectionViewState {
  charts: Array<ChartParameters>
}

interface ConnectionViewStateDictionary {
  [s: string]: ConnectionViewState
}
const connectionViewStateIdentifier: StorageIdentifier<ConnectionViewStateDictionary> = {
  id: 'connection_view_state',
}

export const loadCharts = () => async (dispatch: Dispatch<any>, getState: () => AppState) => {
  const { connectionId } = getState().connection
  if (!connectionId) {
    return
  }

  let viewStates: ConnectionViewStateDictionary | undefined
  try {
    viewStates = await persistentStorage.load(connectionViewStateIdentifier)
  } catch (error) {
    dispatch(showError(error))
  }

  if (!viewStates || !viewStates[connectionId]) {
    dispatch(setCharts([]))
    return
  }

  const viewState = viewStates[connectionId]
  if (viewState) {
    dispatch(setCharts(viewState.charts))
  }
}

export const saveCharts = () => async (dispatch: Dispatch<any>, getState: () => AppState) => {
  const { connectionId } = getState().connection
  if (!connectionId) {
    return
  }

  const charts = getState().charts.get('charts').toArray()

  let viewStates: ConnectionViewStateDictionary | undefined
  try {
    viewStates = (await persistentStorage.load(connectionViewStateIdentifier)) || {}
    const state: ConnectionViewState = viewStates[connectionId] || { charts: [] }
    state.charts = charts

    viewStates[connectionId] = state
    await persistentStorage.store(connectionViewStateIdentifier, viewStates)
  } catch (error) {
    dispatch(showError(error))
  }
}

export const addChart =
  (chartParameters: ChartParameters) => async (dispatch: Dispatch<any>, getState: () => AppState) => {
    const chartExists = Boolean(
      getState()
        .charts.get('charts')
        .find(chart => chart.topic === chartParameters.topic && chart.dotPath === chartParameters.dotPath)
    )
    if (chartExists) {
      dispatch(showNotification('Already added'))
      return
    }

    dispatch({
      type: ActionTypes.CHARTS_ADD,
      chart: chartParameters,
    })
    dispatch(saveCharts())
    dispatch(showNotification('Added to chart panel'))
  }

export const updateChart =
  (chartParameters: ChartParameters) => async (dispatch: Dispatch<any>, getState: () => AppState) => {
    dispatch({
      type: ActionTypes.CHARTS_UPDATE,
      topic: chartParameters.topic,
      dotPath: chartParameters.dotPath,
      parameters: chartParameters,
    })
    dispatch(saveCharts())
  }

export const removeChart =
  (chartParameters: ChartParameters) => async (dispatch: Dispatch<any>, getState: () => AppState) => {
    dispatch({
      chart: chartParameters,
      type: ActionTypes.CHARTS_REMOVE,
    })
    dispatch(saveCharts())
  }

export const moveChartUp =
  (parameters: { topic: string; dotPath?: string }) => async (dispatch: Dispatch<any>, getState: () => AppState) => {
    dispatch({
      topic: parameters.topic,
      dotPath: parameters.dotPath,
      type: ActionTypes.CHARTS_MOVE_UP,
    })
    dispatch(saveCharts())
  }

export const setCharts = (charts: Array<ChartParameters>): Action => ({
  charts,
  type: ActionTypes.CHARTS_SET,
})
