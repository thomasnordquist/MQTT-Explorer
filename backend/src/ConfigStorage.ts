import fs from 'fs-extra'
import path from 'path'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { Rpc } from '../../events/EventSystem/Rpc'
import { storageClearEvent, storageLoadEvent, storageStoreEvent } from '../../events/StorageEvents'

type StorageData = Record<string, unknown>

export default class ConfigStorage {
  private file: string
  private database?: Low<StorageData>
  private rpc: Rpc

  constructor(file: string, rpc: Rpc) {
    this.file = file
    this.rpc = rpc
  }

  private async getDb(): Promise<Low<StorageData>> {
    const pathInfo = path.parse(this.file)

    // Ensure that Settings dir exists
    await fs.mkdirp(pathInfo.dir)
    if (!this.database) {
      this.database = new Low<StorageData>(new JSONFile(this.file), {})
      await this.database.read()
      this.database.data = this.database.data ?? {}
    }

    return this.database
  }

  public async init() {
    this.rpc.on(storageStoreEvent, async event => {
      const db = await this.getDb()
      db.data[event.store] = event.data
      await db.write()
      return
    })

    this.rpc.on(storageLoadEvent, async event => {
      const db = await this.getDb()
      const data = db.data[event.store]
      return {
        data,
        store: event.store,
      }
    })

    this.rpc.on(storageClearEvent, async event => {
      const db = await this.getDb()
      db.data = {}
      await db.write()
    })
  }
}
