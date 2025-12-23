import FileAsync from 'lowdb/adapters/FileAsync'
import fs from 'fs-extra'
import lowdb from 'lowdb'
import path from 'path'
import { Rpc } from '../../events/EventSystem/Rpc'
import { storageClearEvent, storageLoadEvent, storageStoreEvent } from '../../events/StorageEvents'

export default class ConfigStorage {
  private file: string
  private database: any
  private rpc: Rpc

  constructor(file: string, rpc: Rpc) {
    this.file = file
    this.rpc = rpc
  }

  private async getDb() {
    const pathInfo = path.parse(this.file)

    // Ensure that Settings dir exists
    await fs.mkdirp(pathInfo.dir)
    const adapter = new FileAsync(this.file)
    if (!this.database) {
      this.database = await lowdb(adapter)
    }

    return this.database
  }

  public async init() {
    this.rpc.on(storageStoreEvent, async event => {
      const db = await this.getDb()
      await db.set(event.store, event.data).write()
      return
    })

    this.rpc.on(storageLoadEvent, async event => {
      const db = await this.getDb()
      const data = await db.get(event.store).value()
      return {
        data,
        store: event.store,
      }
    })

    this.rpc.on(storageClearEvent, async event => {
      const db = await this.getDb()
      const keys = await db.keys().value()
      for (const key of keys) {
        await db.unset(key).write()
      }
    })
  }
}
