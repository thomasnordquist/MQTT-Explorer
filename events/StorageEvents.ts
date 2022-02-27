import { RpcEvent } from './EventSystem/Rpc'

export interface StoreCommand {
  store: string
  data: any
}

export interface LoadCommand {
  store: string
}

export const storageStoreEvent: RpcEvent<StoreCommand, void> = {
  topic: 'storage/store',
}

export const storageLoadEvent: RpcEvent<LoadCommand, StoreCommand> = {
  topic: 'storage/load',
}

export const storageClearEvent: RpcEvent<void, void> = {
  topic: 'storage/clear',
}
