import * as FileAsync from 'lowdb/adapters/FileAsync'
import * as lowdb from 'lowdb'
import { backendEvents } from '../../events'
import {
  makeStorageResponseEvent,
  storageClearEvent,
  storageLoadEvent,
  storageStoreEvent,
  makeStorageAcknoledgementEvent,
} from '../../events/StorageEvents'

export default class ConfigStorage {
  private adapter: any
  constructor(file: string) {
    this.adapter = new FileAsync(file)
  }

  public async init() {
    const database: lowdb.LoDashExplicitAsyncWrapper<any> = await lowdb(this.adapter)
    backendEvents.subscribe(storageStoreEvent, async (event) => {
      await database.set(event.store, event.data).write()
      backendEvents.emit(makeStorageAcknoledgementEvent(event.transactionId), undefined)
    })

    backendEvents.subscribe(storageLoadEvent, async (event) => {
      const responseEvent = makeStorageResponseEvent(event.transactionId)
      try {
        const data = await database.get(event.store).value()
        backendEvents.emit(responseEvent, { data, transactionId: event.transactionId })
      } catch (error) {
        console.error(error)
        backendEvents.emit(responseEvent, { transactionId: event.transactionId })
      }
    })

    backendEvents.subscribe(storageClearEvent, async (event) => {
      await database.drop()
      backendEvents.emit(makeStorageAcknoledgementEvent(event.transactionId), undefined)
    })
  }
}
