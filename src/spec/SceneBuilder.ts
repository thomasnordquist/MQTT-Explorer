export interface Scene {
  name: SceneNames,
  start: number
  stop: number
  duration: number
}

export type SceneNames = 'connect'
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
  | 'end'

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
    })
  }
}
