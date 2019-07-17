export interface MemoryConsumptionExpressedByLength {
  length: number
}

export class RingBuffer<T extends MemoryConsumptionExpressedByLength> {
  public capacity: number
  public maxItems: number
  public compactionFactor: number
  protected items: Array<T> = []
  protected start: number = 0
  protected end: number = 0
  private usage: number = 0

  constructor(capacity: number, maxItems = Infinity, compactionFactor: number = 10, ringBuffer?: RingBuffer<T>) {
    this.capacity = capacity
    this.maxItems = maxItems
    this.compactionFactor = compactionFactor

    if (ringBuffer) {
      this.items = ringBuffer.toArray()
      this.end = this.items.length
      this.usage = ringBuffer.usage
    }
  }

  private enforceCapacityConstraints(addedItemSize: number) {
    const remainingSize = this.capacity - (this.usage + addedItemSize)
    if (remainingSize < 0) {
      this.freeSomeSpace(Math.abs(remainingSize))
    }
    while (this.end - this.start >= this.maxItems) {
      this.dropFirst()
    }
  }

  private compact() {
    this.items = this.toArray()
    this.start = 0
    this.end = this.items.length
  }

  private freeSpace(): number {
    return this.capacity - this.usage
  }

  private isEmpty(): boolean {
    return this.usage === 0
  }

  private freeSomeSpace(requiredSpace: number) {
    while (this.freeSpace() < requiredSpace && !this.isEmpty()) {
      this.dropFirst()
    }
  }

  private dropFirst() {
    const firstItem = this.items[this.start]
    delete this.items[this.start]
    this.start += 1

    const freedSpace = firstItem.length
    this.usage -= freedSpace
  }

  public setCapacity(items: number, bytes: number) {
    this.maxItems = items
    this.capacity = bytes
  }

  public clone(): RingBuffer<T> {
    return new RingBuffer(this.capacity, this.maxItems, this.compactionFactor, this)
  }

  public toArray() {
    return this.items.slice(this.start, this.end)
  }

  public count() {
    return this.end - this.start
  }

  public last(): T | undefined {
    return this.items[this.end - 1]
  }

  public add(item: T) {
    const size = item.length
    this.enforceCapacityConstraints(size)
    this.usage += size
    this.items[this.end] = item
    this.end += 1

    if (this.end > 10 * this.maxItems) {
      this.compact()
    }
  }
}
