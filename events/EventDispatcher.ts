import { EventEmitter } from 'events'

interface CallbackStore {
  wrappedCallback: any
  callback: any
}

export class EventDispatcher<Message, Dispatcher> {
  private emitter = new EventEmitter()
  private dispatcher: Dispatcher
  private callbacks: CallbackStore[] = []

  constructor(dispatcher: Dispatcher) {
    this.dispatcher = dispatcher
  }

  public dispatch(msg: Message) {
    this.emitter.emit('event', msg)
  }

  public subscribe(callback: (msg: Message, dispatcher: Dispatcher) => void) {
    const wrappedCallback = (msg: Message) => {
      callback(msg, this.dispatcher)
    }
    this.emitter.on('event', wrappedCallback)

    this.callbacks.push({
      callback,
      wrappedCallback,
    })
  }

  public unsubscribe(callback: (msg: Message, dispatcher: Dispatcher) => void) {
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
