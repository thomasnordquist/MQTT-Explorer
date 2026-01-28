import { storageStoreEvent, storageLoadEvent, storageClearEvent } from '../../../events/StorageEvents'
import { rendererRpc } from '../eventBus'

export interface StorageIdentifier<Model> {
  id: string
}

export interface PersistentStorage {
  store<Model>(identifier: StorageIdentifier<Model>, data: Model): Promise<void>
  load<Model>(identifier: StorageIdentifier<Model>): Promise<Model | undefined>
  clear(): Promise<void>
}

class RemoteStorage implements PersistentStorage {
  public store<Model>(identifier: StorageIdentifier<Model>, data: Model): Promise<void> {
    return rendererRpc.call(storageStoreEvent, {
      data,
      store: identifier.id,
    })
  }

  public async load<Model>(identifier: StorageIdentifier<Model>): Promise<Model | undefined> {
    const result = await rendererRpc.call(
      storageLoadEvent,
      {
        store: identifier.id,
      },
      10000
    )

    return (result as any).data
  }

  public clear(): Promise<void> {
    return rendererRpc.call(storageClearEvent, undefined, 10000)
  }
}

export default new RemoteStorage()
