import * as FileAsync from 'lowdb/adapters/FileAsync'
import * as fs from 'fs-extra'
import * as lowdb from 'lowdb'
import * as path from 'path'
import { backendRpc } from '../../events'
import {
  storageClearEvent,
  storageLoadEvent,
  storageStoreEvent,
} from '../../events/StorageEvents'

export default class ConfigStorage {
  private file: string
  private database: any
  constructor(file: string) {
    this.file = file
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
    backendRpc.on(storageStoreEvent, async event => {
      const db = await this.getDb()
      await db.set(event.store, event.data).write()
      return
    })

    backendRpc.on(storageLoadEvent, async event => {
      const db = await this.getDb()
      const data = await db.get(event.store).value()
      return {
        data,
        store: event.store,
      }
    })

    backendRpc.on(storageClearEvent, async event => {
      const db = await this.getDb()
      const keys = await db.keys().value()
      for (const key of keys) {
        await db.unset(key).write()
      }
    })
  }
}
