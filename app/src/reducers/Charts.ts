import { Action } from 'redux'
import { createReducer } from './lib'
import { Record, List } from 'immutable'

export type PlotCurveTypes = 'curve' | 'linear' | 'cubic_basis_spline' | 'step_after' | 'step_before'

export interface ChartParameters {
  topic: string
  dotPath?: string
  interpolation?: PlotCurveTypes
  range?: {
    from?: number
    to?: number
  }
}

export interface ChartsStateModel {
  charts: List<ChartParameters>
}

export type ChartsState = Record<ChartsStateModel>

export type Action = AddChart | RemoveChart | SetCharts | UpdateChart

export enum ActionTypes {
  CHARTS_ADD = 'CHARTS_ADD',
  CHARTS_REMOVE = 'CHARTS_REMOVE',
  CHARTS_SET = 'CHARTS_SET',
  CHARTS_UPDATE = 'CHARTS_UPDATE',
}

export interface AddChart {
  type: ActionTypes.CHARTS_ADD
  chart: ChartParameters
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
})

function addChart(state: ChartsState, action: AddChart) {
  return state.set('charts', state.get('charts').push(action.chart))
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
