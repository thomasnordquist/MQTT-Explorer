import { rendererEvents } from '../../events'
import { v4 } from 'uuid'

import {
  storageStoreEvent,
  makeStorageResponseEvent,
  storageLoadEvent,
  storageClearEvent,
  makeStorageAcknoledgementEvent,
} from '../../events/StorageEvents'

export interface StorageIdentifier<Model> {
  id: string
}

export interface PersistantStorage {
  store<Model>(identifier: StorageIdentifier<Model>, data: Model): Promise<void>
  load<Model>(identifier: StorageIdentifier<Model>): Promise<Model | undefined>
  clear(): Promise<void>
}

class RemoteStorage implements PersistantStorage {
  private timeoutCallback(event: any, callback: any, reject: any) {
    setTimeout(() => {
      reject('remote storage timeout')
      rendererEvents.unsubscribe(event, callback)
    }, 10000)
  }

  private expectAck(transactionId: string): Promise<void> {
    const ack = makeStorageAcknoledgementEvent(transactionId)
    return new Promise<void>((resolve, reject) => {
      const callback = (msg: any) => {
        if (msg && msg.error) {
          reject(msg.error)
        } else {
          resolve()
        }
        rendererEvents.unsubscribe(ack, callback)
      }
      rendererEvents.subscribe(ack, callback)
      this.timeoutCallback(ack, callback, reject)
    })
  }

  public store<Model>(identifier: StorageIdentifier<Model>, data: Model): Promise<void> {
    const transactionId = v4()
    const expectation = this.expectAck(transactionId)
    rendererEvents.emit(storageStoreEvent, { data, transactionId, store: identifier.id })
    return expectation
  }

  public load<Model>(identifier: StorageIdentifier<Model>): Promise<Model | undefined> {
    const transactionId = v4()
    const responseEvent = makeStorageResponseEvent(transactionId)

    const promise = new Promise<Model>((resolve, reject) => {
      const callback = (msg: any) => {
        if (msg.error) {
          reject(msg.error)
        } else {
          resolve(msg.data)
        }
        rendererEvents.unsubscribe(responseEvent, callback)
      }
      rendererEvents.subscribe(responseEvent, callback)
      this.timeoutCallback(responseEvent, callback, reject)
    })

    rendererEvents.emit(storageLoadEvent, {
      transactionId,
      store: identifier.id,
    })

    return promise
  }

  public clear(): Promise<void> {
    const transactionId = v4()
    const expectation = this.expectAck(transactionId)

    rendererEvents.emit(storageClearEvent, { transactionId })
    return expectation
  }
}

export default new RemoteStorage()
