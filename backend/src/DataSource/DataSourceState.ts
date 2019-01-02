import { EventEmitter } from 'events'

export interface DataSourceState {
  connecting: boolean
  connected: boolean
  error?: Error
}

export class DataSourceStateMachine extends EventEmitter {
  private state: DataSourceState = {
    error: undefined,
    connected: false,
    connecting: false,
  }

  public setConnected(connected: boolean) {
    this.state = {
      connected,
      error: undefined,
      connecting: false,
    }
  }

  public setError(error: Error) {
    this.state = {
      error,
      connected: false,
      connecting: false,
    }
  }

  public setConnecting() {
    this.state = {
      error: undefined,
      connected: false,
      connecting: true,
    }
  }

  public toJSON() {
    return this.state
  }
}
