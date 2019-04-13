export interface Scene {
  name: string,
  start: number
  stop: number
  duration: number
}

export class SceneBuilder {
  public scenes: Array<Scene> = []
  public offset = Date.now()

  public async record(name: string, callback: () => Promise<any>): Promise<any> {
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