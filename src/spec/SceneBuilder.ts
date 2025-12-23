export interface Scene {
  name: SceneNames
  start: number
  stop: number
  duration: number
  title?: string
}

export type SceneNames =
  | 'connect'
  | 'topic_updates'
  | 'numeric_plots'
  | 'json-formatting'
  | 'diffs'
  | 'publish_topic'
  | 'json_formatting_publish'
  | 'clipboard'
  | 'topic_filter'
  | 'delete_retained_topics'
  | 'settings'
  | 'customize_subscriptions'
  | 'keyboard_shortcuts'
  | 'sparkplugb-decoding'
  | 'end'

export const SCENE_TITLES: Record<SceneNames, string> = {
  connect: 'Connecting to MQTT Broker',
  topic_updates: 'Topic Updates',
  numeric_plots: 'Plot Topic History',
  'json-formatting': 'Formatted Messages',
  diffs: 'Diff Capability',
  publish_topic: 'Publish Topics',
  json_formatting_publish: 'JSON Formatting Publish',
  clipboard: 'Copy to Clipboard',
  topic_filter: 'Search Topic Hierarchy',
  delete_retained_topics: 'Delete Retained Topics',
  settings: 'Settings',
  customize_subscriptions: 'Customize Subscriptions',
  keyboard_shortcuts: 'Keyboard Shortcuts',
  'sparkplugb-decoding': 'SparkplugB Decoding',
  end: 'The End',
}

export class SceneBuilder {
  public scenes: Array<Scene> = []
  public offset = Date.now()

  public async record(name: SceneNames, callback: () => Promise<any>): Promise<any> {
    const start = Date.now() - this.offset
    await callback()
    const stop = Date.now() - this.offset

    this.scenes.push({
      name,
      start,
      stop,
      duration: stop - start,
      title: SCENE_TITLES[name],
    })
  }
}
