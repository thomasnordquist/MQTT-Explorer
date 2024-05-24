export interface Destroyable {
  destroy(): void
}

export interface MemoryLifecycle {
  retain(): void
  release(): void
}
