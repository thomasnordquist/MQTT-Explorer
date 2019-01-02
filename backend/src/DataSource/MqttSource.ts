import { Client, connect as mqttConnect } from 'mqtt'
import { DataSource, DataSourceStateMachine } from './'

export interface MqttOptions {
  url: string
}

export class MqttSource implements DataSource<MqttOptions> {
  private client: Client | undefined
  private messageCallback?: (topic: string, message: Buffer) => void
  private rootSubscription = '#'
  public topicSeparator = '/'

  public onMessage(messageCallback: (topic: string, message: Buffer) => void) {
    this.messageCallback = messageCallback
  }

  public connect(options: MqttOptions): DataSourceStateMachine {
    const state = new DataSourceStateMachine()

    const client = mqttConnect(options.url, {
      resubscribe: false,
    })

    this.client = client

    client.on('error', (error: Error) => {
      state.setError(error)
    })

    client.on('close', () => {
      state.setConnected(false)
    })

    client.on('reconnect', () => {
      state.setConnecting()
    })

    client.on('connect', () => {
      state.setConnected(true)
      client.subscribe(this.rootSubscription, (err: Error) => {
        if (err) {
          throw new Error('mqtt subscription failed')
        }
      })
    })

    client.on('message', (topic, message) => {
      this.messageCallback && this.messageCallback(topic, message)
    })

    return state
  }

  public disconnect() {
    this.client && this.client.end()
  }
}
