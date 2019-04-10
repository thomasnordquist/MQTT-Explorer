import { createReducer } from './lib'
import { Record } from 'immutable'

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

export type Actions = SetAutoExpandLimitAction
  & DidLoadSettingsAction
  & ToggleVisibilityAction
  & SetTopicOrderAction
  & FilterTopicsAction
  & ToggleHighlightTopicUpdatesAction
  & SetValueRendererDisplayModeAction
  & SetTheme
  & SetSelectTopicWithMouseOverAction

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

const initialState = Record<SettingsState>({
  autoExpandLimit: 0,
  topicOrder: TopicOrder.none,
  visible: false,
  highlightTopicUpdates: true,
  valueRendererDisplayMode: 'diff',
  selectTopicWithMouseOver: false,
  theme: 'light',
  topicFilter: undefined,
})

const setTheme = (theme: 'light' | 'dark') => (state: Record<SettingsState>) => {
  return state.set('theme', theme)
}

const reducerActions: {[s: string]: (state: Record<SettingsState>, action: Actions) => Record<SettingsState>} = {
  SETTINGS_SET_AUTO_EXPAND_LIMIT: setAutoExpandLimit,
  SETTINGS_TOGGLE_VISIBILITY: toggleVisibility,
  SETTINGS_SET_TOPIC_ORDER: setTopicOrder,
  SETTINGS_FILTER_TOPICS: filterTopics,
  SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY: toggleHighlightTopicUpdates,
  SETTINGS_DID_LOAD_SETTINGS: didLoadSettings,
  SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE: setValueRendererDisplayMode,
  SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER: setSelectTopicWithMouseOver,
  SETTINGS_SET_THEME_LIGHT: setTheme('light'),
  SETTINGS_SET_THEME_DARK: setTheme('dark'),
}

export const settingsReducer = createReducer(initialState(), reducerActions)

export interface SetTheme {
  type: ActionTypes.SETTINGS_SET_THEME_LIGHT | ActionTypes.SETTINGS_SET_THEME_DARK
  theme: 'light'
}

export interface DidLoadSettingsAction {
  type: ActionTypes.SETTINGS_DID_LOAD_SETTINGS
  settings: Partial<SettingsState>
}

function didLoadSettings(state: Record<SettingsState>, action: DidLoadSettingsAction) {
  return state.merge(action.settings)
}

export interface SetSelectTopicWithMouseOverAction {
  type: ActionTypes.SETTINGS_SET_SELECT_TOPIC_WITH_MOUSE_OVER
  selectTopicWithMouseOver: boolean
}

export function setSelectTopicWithMouseOver(state: Record<SettingsState>, action: SetSelectTopicWithMouseOverAction) {
  return state.set('selectTopicWithMouseOver', !state.get('selectTopicWithMouseOver'))
}

export interface SetValueRendererDisplayModeAction {
  type: ActionTypes.SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE
  valueRendererDisplayMode: ValueRendererDisplayMode
}

export function setValueRendererDisplayMode(state: Record<SettingsState>, action: SetValueRendererDisplayModeAction) {
  return state.set('valueRendererDisplayMode', action.valueRendererDisplayMode)
}

export interface SetAutoExpandLimitAction {
  type: ActionTypes.SETTINGS_SET_AUTO_EXPAND_LIMIT
  autoExpandLimit: number
}

function setAutoExpandLimit(state: Record<SettingsState>, action: SetAutoExpandLimitAction) {
  return state.set('autoExpandLimit', action.autoExpandLimit)
}

export interface ToggleHighlightTopicUpdatesAction {
  type: ActionTypes.SETTINGS_TOGGLE_HIGHLIGHT_ACTIVITY
}

function toggleHighlightTopicUpdates(state: Record<SettingsState>, action: ToggleHighlightTopicUpdatesAction) {
  return state.set('highlightTopicUpdates', !state.get('highlightTopicUpdates'))
}

export interface ToggleVisibilityAction {
  type: ActionTypes.SETTINGS_TOGGLE_VISIBILITY
}

// Todo: Should not be part of the settings store, it would require all tree nodes to re-render when toggeling settings
function toggleVisibility(state: Record<SettingsState>, action: ToggleVisibilityAction) {
  return state.set('visible', !state.get('visible'))
}

export interface SetTopicOrderAction {
  type: ActionTypes.SETTINGS_SET_TOPIC_ORDER
  topicOrder: TopicOrder
}

function setTopicOrder(state: Record<SettingsState>, action: SetTopicOrderAction) {
  return state.set('topicOrder', action.topicOrder)
}

export interface FilterTopicsAction {
  type: ActionTypes.SETTINGS_FILTER_TOPICS
  topicFilter: string
}

// @Todo: move to tree reducer, should not be persisted / is no application setting
function filterTopics(state: Record<SettingsState>, action: FilterTopicsAction) {
  return state.set('topicFilter', action.topicFilter)
}
