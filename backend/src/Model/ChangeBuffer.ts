import { MqttMessage } from '../../../events'

interface BufferedMessage {
  message: MqttMessage
  received: Date
}

export class ChangeBuffer {
  private buffer: Array<BufferedMessage> = []
  private size = 0
  private maxSize = 100_000_000 // ~100MB
  public length = 0
  public estimatedMessageOverhead = 24

  public push(val: MqttMessage) {
    if (!this.isFull()) {
      this.buffer.push({ message: val, received: new Date() })
      this.size += this.estimatedMessageOverhead + (val.payload ? val.payload.length : 0)
      this.length += 1
    }
  }

  public getSize() {
    return this.size
  }

  public isFull() {
    return this.size >= this.maxSize
  }

  public fillState() {
    return this.size / this.maxSize
  }

  public popAll(): Array<BufferedMessage> {
    const tmpBuffer = this.buffer
    this.buffer = []
    this.size = 0
    this.length = 0

    return tmpBuffer
  }
}
