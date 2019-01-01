interface InternalState {
  connecting: boolean
  connected: boolean
  error?: Error
}

export class DataSourceState {
  private state: InternalState = {
    error: undefined,
    connected: false,
    connecting: false
  }

  public setConnected(connected: boolean) {
    this.state = {
      error: undefined,
      connected: connected,
      connecting: false
    }
  }

  public setError(error: Error) {
    this.state = {
      error: error,
      connected: false,
      connecting: false
    }
  }

  public setConnecting() {
    this.state = {
      error: undefined,
      connected: false,
      connecting: true
    }
  }

  public toJSON() {
    return this.state
  }
}
