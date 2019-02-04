export interface StorageIdentifier<Model> {
  id: string
}

export interface PersistantStorage {
  store<Model>(identifier: StorageIdentifier<Model>, data: Model): void
  load<Model>(identifier: StorageIdentifier<Model>): Model | undefined
}

class LocalStorage implements PersistantStorage {
  public store<Model>(identifier: StorageIdentifier<Model>, data: Model) {
    localStorage.setItem(identifier.id, JSON.stringify(data))
  }

  public load<Model>(identifier: StorageIdentifier<Model>): Model | undefined {
    const data = localStorage.getItem(identifier.id)

    return data && JSON.parse(data)
  }
}

export default new LocalStorage()
