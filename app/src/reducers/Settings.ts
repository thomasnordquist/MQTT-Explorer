import { Record } from 'immutable'
import { createReducer } from './lib'

export enum TopicOrder {
  none = 'none',
  messages = '#messages',
  abc = 'abc',
  topics = '#topics',
}

export type ValueRendererDisplayMode = 'diff' | 'raw'
export interface SettingsStateModel {
  autoExpandLimit: number
  timeLocale: string
  topicOrder: TopicOrder
  topicFilter?: string
  highlightTopicUpdates: boolean
  valueRendererDisplayMode: ValueRendererDisplayMode
  selectTopicWithMouseOver: boolean
  theme: 'light' | 'dark'
}

export type SettingsState = Record<SettingsStateModel>

export type Actions = SetAutoExpandLimitAction &
  DidLoadSettingsAction &
  SetTopicOrderAction &
  FilterTopicsAction &
  ToggleHighlightTopicUpdatesAction &
  SetValueRendererDisplayModeAction &
  SetTheme &
  SetSelectTopicWithMouseOverAction &
  SetTimeLocale

export enum ActionTypes {
  SETTINGS_SET_AUTO_EXPAND_LIMIT = 'SETTINGS_SET_AUTO_EXPAND_LIMIT',
  SETTINGS_SET_TOPIC_ORDER = 'SETTINGS_SET_TOPIC_ORDER',
  SETTINGS_FILTER_TOPICS = 'SETTINGS_FILTER_TOPICS',
  SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY = 'SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY',
  SETTINGS_DID_LOAD_SETTINGS = 'SETTINGS_DID_LOAD_SETTINGS',
  SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE = 'SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE',
  SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER = 'SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER',
  SETTINGS_SET_THEME_LIGHT = 'SETTINGS_SET_THEME_LIGHT',
  SETTINGS_SET_THEME_DARK = 'SETTINGS_SET_THEME_DARK',
  SETTINGS_SET_TIME_LOCALE = 'SETTINGS_SET_TIME_LOCALE',
}

const initialState = Record<SettingsStateModel>({
  timeLocale: window.navigator.language,
  autoExpandLimit: 0,
  topicOrder: TopicOrder.none,
  highlightTopicUpdates: true,
  valueRendererDisplayMode: 'diff',
  selectTopicWithMouseOver: false,
  theme: 'light',
  topicFilter: undefined,
})

const setTheme = (theme: 'light' | 'dark') => (state: SettingsState) => state.set('theme', theme)

const reducerActions: {
  [s: string]: (state: SettingsState, action: Actions) => SettingsState
} = {
  SETTINGS_SET_AUTO_EXPAND_LIMIT: setAutoExpandLimit,
  SETTINGS_SET_TOPIC_ORDER: setTopicOrder,
  SETTINGS_FILTER_TOPICS: filterTopics,
  SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY: toggleHighlightTopicUpdates,
  SETTINGS_DID_LOAD_SETTINGS: didLoadSettings,
  SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE: setValueRendererDisplayMode,
  SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER: setSelectTopicWithMouseOver,
  SETTINGS_SET_THEME_LIGHT: setTheme('light'),
  SETTINGS_SET_THEME_DARK: setTheme('dark'),
  SETTINGS_SET_TIME_LOCALE: setTimeLocale,
}

export const settingsReducer = createReducer(initialState(), reducerActions)

export interface SetTheme {
  type: ActionTypes.SETTINGS_SET_THEME_LIGHT | ActionTypes.SETTINGS_SET_THEME_DARK
  theme: 'light' | 'dark'
}

export interface DidLoadSettingsAction {
  type: ActionTypes.SETTINGS_DID_LOAD_SETTINGS
  settings: Partial<SettingsStateModel>
}

function didLoadSettings(state: SettingsState, action: DidLoadSettingsAction): SettingsState {
  return state.merge(action.settings)
}

export interface SetSelectTopicWithMouseOverAction {
  type: ActionTypes.SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER
  selectTopicWithMouseOver: boolean
}

export function setSelectTopicWithMouseOver(state: SettingsState, action: SetSelectTopicWithMouseOverAction) {
  return state.set('selectTopicWithMouseOver', !state.get('selectTopicWithMouseOver'))
}

export interface SetTimeLocale {
  type: ActionTypes.SETTINGS_SET_TIME_LOCALE
  timeLocale: string
}

export function setTimeLocale(state: SettingsState, action: SetTimeLocale): SettingsState {
  return state.set('timeLocale', action.timeLocale)
}

export interface SetValueRendererDisplayModeAction {
  type: ActionTypes.SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE
  valueRendererDisplayMode: ValueRendererDisplayMode
}

export function setValueRendererDisplayMode(state: SettingsState, action: SetValueRendererDisplayModeAction) {
  return state.set('valueRendererDisplayMode', action.valueRendererDisplayMode)
}

export interface SetAutoExpandLimitAction {
  type: ActionTypes.SETTINGS_SET_AUTO_EXPAND_LIMIT
  autoExpandLimit: number
}

function setAutoExpandLimit(state: SettingsState, action: SetAutoExpandLimitAction) {
  return state.set('autoExpandLimit', action.autoExpandLimit)
}

export interface ToggleHighlightTopicUpdatesAction {
  type: ActionTypes.SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY
}

function toggleHighlightTopicUpdates(state: SettingsState, action: ToggleHighlightTopicUpdatesAction) {
  return state.set('highlightTopicUpdates', !state.get('highlightTopicUpdates'))
}

export interface SetTopicOrderAction {
  type: ActionTypes.SETTINGS_SET_TOPIC_ORDER
  topicOrder: TopicOrder
}

function setTopicOrder(state: SettingsState, action: SetTopicOrderAction) {
  return state.set('topicOrder', action.topicOrder)
}

export interface FilterTopicsAction {
  type: ActionTypes.SETTINGS_FILTER_TOPICS
  topicFilter: string
}

// @Todo: move to tree reducer, should not be persisted / is no application setting
function filterTopics(state: SettingsState, action: FilterTopicsAction) {
  return state.set('topicFilter', action.topicFilter)
}
