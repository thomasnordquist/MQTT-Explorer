import { Action } from 'redux'
import { createReducer } from './lib'

export enum TopicOrder {
  none = 'none',
  messages = '#messages',
  abc = 'abc',
  topics = '#topics',
}

export type ValueRendererDisplayMode = 'diff' | 'raw'

export interface SettingsState {
  autoExpandLimit: number
  visible: boolean
  topicOrder: TopicOrder
  topicFilter?: string
  highlightTopicUpdates: boolean
  valueRendererDisplayMode: ValueRendererDisplayMode
  selectTopicWithMouseOver: boolean
  theme: 'light' | 'dark'
}

export type Action = SetAutoExpandLimit | ToggleVisibility | SetTopicOrder | FilterTopics | TogglehighlightTopicUpdates | SetValueRendererDisplayMode | SetTheme

export enum ActionTypes {
  SETTINGS_SET_AUTO_EXPAND_LIMIT = 'SETTINGS_SET_AUTO_EXPAND_LIMIT',
  SETTINGS_TOGGLE_VISIBILITY = 'SETTINGS_TOGGLE_VISIBILITY',
  SETTINGS_SET_TOPIC_ORDER = 'SETTINGS_SET_TOPIC_ORDER',
  SETTINGS_FILTER_TOPICS = 'SETTINGS_FILTER_TOPICS',
  SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY = 'SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY',
  SETTINGS_DID_LOAD_SETTINGS = 'SETTINGS_DID_LOAD_SETTINGS',
  SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE = 'SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE',
  SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER = 'SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER',
  SETTINGS_SET_THEME_LIGHT = 'SETTINGS_SET_THEME_LIGHT',
  SETTINGS_SET_THEME_DARK = 'SETTINGS_SET_THEME_DARK',
}

const initialState: SettingsState = {
  autoExpandLimit: 0,
  topicOrder: TopicOrder.none,
  visible: false,
  highlightTopicUpdates: true,
  valueRendererDisplayMode: 'diff',
  selectTopicWithMouseOver: false,
  theme: 'dark',
}

const setTheme = (theme: 'light' | 'dark') => (state: SettingsState) => {
  return {
    ...state,
    theme,
  }
}

export const settingsReducer = createReducer(initialState, {
  SETTINGS_SET_AUTO_EXPAND_LIMIT: setAutoExpandLimit,
  SETTINGS_TOGGLE_VISIBILITY: toggleVisibility,
  SETTINGS_SET_TOPIC_ORDER: setTopicOrder,
  SETTINGS_FILTER_TOPICS: filterTopics,
  SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY: togglehighlightTopicUpdates,
  SETTINGS_DID_LOAD_SETTINGS: didLoadSettings,
  SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE: setValueRendererDisplayMode,
  SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER: setSelectTopicWithMouseOver,
  SETTINGS_SET_THEME_LIGHT: setTheme('light'),
  SETTINGS_SET_THEME_DARK: setTheme('dark'),
})

export interface SetTheme {
  type: ActionTypes.SETTINGS_SET_THEME_LIGHT | ActionTypes.SETTINGS_SET_THEME_DARK
  theme: 'light'
}

export interface DidLoadSettings {
  type: ActionTypes.SETTINGS_DID_LOAD_SETTINGS
  settings: Partial<SettingsState>
}

function didLoadSettings(state: SettingsState, action: DidLoadSettings) {
  return {
    ...state,
    ...action.settings,
  }
}

export interface SetSelectTopicWithMouseOver {
  type: ActionTypes.SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER
  selectTopicWithMouseOver: boolean
}

export function setSelectTopicWithMouseOver(state: SettingsState, action: SetSelectTopicWithMouseOver) {
  return {
    ...state,
    selectTopicWithMouseOver: action.selectTopicWithMouseOver,
  }
}

export interface SetValueRendererDisplayMode {
  type: ActionTypes.SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE
  valueRendererDisplayMode: ValueRendererDisplayMode
}

export function setValueRendererDisplayMode(state: SettingsState, action: SetValueRendererDisplayMode) {
  return {
    ...state,
    valueRendererDisplayMode: action.valueRendererDisplayMode,
  }
}

export interface SetAutoExpandLimit {
  type: ActionTypes.SETTINGS_SET_AUTO_EXPAND_LIMIT
  autoExpandLimit: number
}

function setAutoExpandLimit(state: SettingsState, action: SetAutoExpandLimit) {
  return {
    ...state,
    autoExpandLimit: action.autoExpandLimit,
  }
}

export interface TogglehighlightTopicUpdates {
  type: ActionTypes.SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY
}

function togglehighlightTopicUpdates(state: SettingsState, _action: TogglehighlightTopicUpdates) {
  return {
    ...state,
    highlightTopicUpdates: !state.highlightTopicUpdates,
  }
}

export interface ToggleVisibility {
  type: ActionTypes.SETTINGS_TOGGLE_VISIBILITY
}

function toggleVisibility(state: SettingsState, action: ToggleVisibility) {
  return {
    ...state,
    visible: !state.visible,
  }
}

function setTopicOrder(state: SettingsState, action: SetTopicOrder) {
  return {
    ...state,
    topicOrder: action.topicOrder,
  }
}

export interface SetTopicOrder {
  type: ActionTypes.SETTINGS_SET_TOPIC_ORDER
  topicOrder: string
}

function filterTopics(state: SettingsState, action: FilterTopics) {
  return {
    ...state,
    topicFilter: action.topicFilter,
  }
}

export interface FilterTopics {
  type: ActionTypes.SETTINGS_FILTER_TOPICS
  topicFilter: string
}
