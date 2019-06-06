interface Lengthwise {
  length: number
}

export class RingBuffer<T extends Lengthwise> {
  private capacity: number
  private maxItems: number
  private usage: number = 0
  private items: Array<T> = []
  private start: number = 0
  private end: number = 0

  constructor(capacity: number, maxItems = Infinity, ringBuffer?: RingBuffer<T>) {
    this.capacity = capacity
    this.maxItems = maxItems

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
    while ((this.end - this.start) >= this.maxItems) {
      this.dropFirst()
    }
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

  public clone(): RingBuffer<T> {
    return new RingBuffer(this.capacity, this.maxItems, this)
  }

  public toArray() {
    return this.items.slice(this.start, this.end)
  }

  public count() {
    return this.end - this.start
  }

  public add(item: T) {
    const size = item.length
    this.enforceCapacityConstraints(size)
    this.usage += size
    this.items[this.end] = item
    this.end += 1
  }
}
