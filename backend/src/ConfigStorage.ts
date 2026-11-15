import { JSONFilePreset } from 'lowdb/node'
import fs from 'fs-extra'
import path from 'path'
import { Rpc } from '../../events/EventSystem/Rpc'
import { storageClearEvent, storageLoadEvent, storageStoreEvent } from '../../events/StorageEvents'

type StorageData = Record<string, unknown>

export default class ConfigStorage {
  private file: string
  private database: Awaited<ReturnType<typeof JSONFilePreset<StorageData>>> | null = null
  private rpc: Rpc

  constructor(file: string, rpc: Rpc) {
    this.file = file
    this.rpc = rpc
  }

  private async getDb() {
    const pathInfo = path.parse(this.file)

    // Ensure that Settings dir exists
    await fs.mkdirp(pathInfo.dir)
    if (!this.database) {
      this.database = await JSONFilePreset<StorageData>(this.file, {})
    }

    return this.database
  }

  public async init() {
    this.rpc.on(storageStoreEvent, async event => {
      const db = await this.getDb()
      await db.read()
      db.data[event.store] = event.data
      await db.write()
      return
    })

    this.rpc.on(storageLoadEvent, async event => {
      const db = await this.getDb()
      await db.read()
      const data = db.data[event.store]
      return {
        data,
        store: event.store,
      }
    })

    this.rpc.on(storageClearEvent, async event => {
      const db = await this.getDb()
      await db.read()
      for (const key of Object.keys(db.data)) {
        delete db.data[key]
      }
      await db.write()
    })
  }
}
