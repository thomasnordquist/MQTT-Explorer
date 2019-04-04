import * as FileAsync from 'lowdb/adapters/FileAsync'
import * as lowdb from 'lowdb'
import { backendEvents } from '../../events'
import {
  makeStorageResponseEvent,
  storageClearEvent,
  storageLoadEvent,
  storageStoreEvent,
  makeStorageAcknowledgementEvent
} from '../../events/StorageEvents'

export default class ConfigStorage {
  private file: string
  private database: any
  constructor(file: string) {
    this.file = file
  }

  private async getDb() {
    const adapter = new FileAsync(this.file)
    if (!this.database) {
      this.database = await lowdb(adapter)
    }

    return this.database
  }

  public async init() {
    backendEvents.subscribe(storageStoreEvent, async (event) => {
      const ack = makeStorageAcknowledgementEvent(event.transactionId)
      try {
        const db = await this.getDb()
        await db.set(event.store, event.data).write()
        backendEvents.emit(ack, undefined)
      } catch (error) {
        backendEvents.emit(ack, { error, transactionId: event.transactionId, store: event.store })
        throw error
      }
    })

    backendEvents.subscribe(storageLoadEvent, async (event) => {
      const responseEvent = makeStorageResponseEvent(event.transactionId)
      try {
        const db = await this.getDb()
        const data = await db.get(event.store).value()
        backendEvents.emit(responseEvent, { data, transactionId: event.transactionId, store: event.store })
      } catch (error) {
        backendEvents.emit(responseEvent, { error, transactionId: event.transactionId, store: event.store })
        throw error
      }
    })

    backendEvents.subscribe(storageClearEvent, async (event) => {
      try {
        const db = await this.getDb()
        const keys = await db.keys().value()
        for (const key of keys) {
          await db.unset(key).write()
        }
        backendEvents.emit(makeStorageAcknowledgementEvent(event.transactionId), undefined)
      } catch (error) {
        backendEvents.emit(makeStorageAcknowledgementEvent(event.transactionId), { error, transactionId: event.transactionId })
        throw error
      }
    })
  }
}
