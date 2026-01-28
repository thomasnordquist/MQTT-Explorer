import { Record, List } from 'immutable'
import { createReducer } from './lib'
import MoveUp from '../components/ChartPanel/ChartSettings/MoveUp'

export type PlotCurveTypes = 'curve' | 'linear' | 'cubic_basis_spline' | 'step_after' | 'step_before'

export interface ChartParameters {
  topic: string
  dotPath?: string
  interpolation?: PlotCurveTypes
  range?: {
    from?: number
    to?: number
  }
  timeRange?: {
    until: string
  }
  width?: 'big' | 'medium' | 'small'
  color?: string
}

export interface ChartsStateModel {
  charts: List<ChartParameters>
}

export type ChartsState = Record<ChartsStateModel>

export type Action = AddChart | RemoveChart | SetCharts | UpdateChart | MoveUp

export enum ActionTypes {
  CHARTS_ADD = 'CHARTS_ADD',
  CHARTS_REMOVE = 'CHARTS_REMOVE',
  CHARTS_SET = 'CHARTS_SET',
  CHARTS_UPDATE = 'CHARTS_UPDATE',
  CHARTS_MOVE_UP = 'CHARTS_MOVE_UP',
}

export interface AddChart {
  type: ActionTypes.CHARTS_ADD
  chart: ChartParameters
}

export interface MoveUp {
  type: ActionTypes.CHARTS_ADD
  topic: string
  dotPath?: string
}

export interface UpdateChart {
  type: ActionTypes.CHARTS_ADD
  topic: string
  dotPath?: string
  parameters: Partial<ChartParameters>
}

export interface RemoveChart {
  type: ActionTypes.CHARTS_REMOVE
  chart: ChartParameters
}

export interface SetCharts {
  type: ActionTypes.CHARTS_SET
  charts: Array<ChartParameters>
}

const initialState = Record<ChartsStateModel>({
  charts: List<ChartParameters>(),
})

export const chartsReducer = createReducer(initialState(), {
  CHARTS_ADD: addChart,
  CHARTS_REMOVE: removeChart,
  CHARTS_SET: setCharts,
  CHARTS_UPDATE: updateChart,
  CHARTS_MOVE_UP: moveUp,
})

function addChart(state: ChartsState, action: AddChart) {
  return state.set('charts', state.get('charts').push(action.chart))
}

function moveUp(state: ChartsState, action: MoveUp) {
  const charts = state.get('charts')
  const idx = charts.findIndex(chart => chart.topic === action.topic && chart.dotPath === action.dotPath)
  const item = charts.get(idx)
  const previousItem = charts.get(idx - 1)

  if (idx === 0 || !item || !previousItem) {
    return state // do nothing
  }

  const newlyOrderedCharts = charts.set(idx - 1, item).set(idx, previousItem)
  return state.set('charts', newlyOrderedCharts)
}

function updateChart(state: ChartsState, action: UpdateChart) {
  const charts = state.get('charts')
  const chartIdx = charts.findIndex(chart => chart.topic === action.topic && chart.dotPath === action.dotPath)
  const chart = charts.get(chartIdx)

  return state.set('charts', chart ? charts.set(chartIdx, { ...chart, ...action.parameters }) : charts)
}

function removeChart(state: ChartsState, action: RemoveChart) {
  const charts = state.get('charts')
  const newCharts = charts.filter(chart => chart.topic !== action.chart.topic || chart.dotPath !== action.chart.dotPath)
  return state.set('charts', newCharts)
}

function setCharts(state: ChartsState, action: SetCharts) {
  return state.set('charts', List(action.charts))
}
