import { Event } from './'

interface StorageEvent {
  transactionId: string
}

export interface StoreCommand extends StorageEvent {
  store?: string,
  data?: any
  error?: any
}

export interface LoadCommand extends StorageEvent {
  store: string,
}

export const storageStoreEvent: Event<StoreCommand> = {
  topic: 'storage/store',
}

export const storageLoadEvent: Event<LoadCommand> = {
  topic: 'storage/load',
}

export function makeStorageAcknowledgementEvent(transactionId: string): Event<StoreCommand> {
  return {
    topic: `storage/ack/${transactionId}`,
  }
}

export function makeStorageResponseEvent(transactionId: string): Event<StoreCommand> {
  return {
    topic: `storage/response/${transactionId}`,
  }
}

export const storageClearEvent: Event<StorageEvent> = {
  topic: 'storage/clear',
}
