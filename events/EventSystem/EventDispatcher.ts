import { EventEmitter } from 'events'

interface CallbackStore {
  wrappedCallback: any
  callback: any
}

export class EventDispatcher<Message> {
  private emitter = new EventEmitter()

  private callbacks: Array<CallbackStore> = []

  public dispatch(msg: Message) {
    this.emitter.emit('event', msg)
  }

  public subscribe(callback: (msg: Message) => void) {
    const wrappedCallback = (msg: Message) => {
      callback(msg)
    }
    this.emitter.on('event', wrappedCallback)

    this.callbacks.push({
      callback,
      wrappedCallback,
    })
  }

  public unsubscribe(callback: (msg: Message) => void) {
    const item = this.callbacks.find(store => store.callback === callback)
    if (!item) {
      return
    }

    this.emitter.removeListener('event', item.wrappedCallback)
    this.callbacks = this.callbacks.filter(a => a !== item)
  }

  public removeAllListeners() {
    this.emitter.removeAllListeners()
    this.callbacks = []
  }
}
