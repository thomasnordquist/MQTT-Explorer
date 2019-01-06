import { Client, connect as mqttConnect } from 'mqtt'
import { DataSource, DataSourceStateMachine } from './'

export interface MqttOptions {
  url: string
  username?: string
  password?: string
  ssl: boolean
  sslValidation: boolean
}

export class MqttSource implements DataSource<MqttOptions> {
  public stateMachine: DataSourceStateMachine = new DataSourceStateMachine()
  private client: Client | undefined
  private messageCallback?: (topic: string, message: Buffer) => void
  private rootSubscription = '#'
  public topicSeparator = '/'

  public onMessage(messageCallback: (topic: string, message: Buffer) => void) {
    this.messageCallback = messageCallback
  }

  public connect(options: MqttOptions): DataSourceStateMachine {
    this.stateMachine.setConnecting()
    const client = mqttConnect(options.url, {
      resubscribe: false,
    })

    this.client = client

    client.on('error', (error: Error) => {
      this.stateMachine.setError(error)
    })

    client.on('close', () => {
      this.stateMachine.setConnected(false)
    })

    client.on('reconnect', () => {
      this.stateMachine.setConnecting()
    })

    client.on('connect', () => {
      this.stateMachine.setConnected(true)
      client.subscribe(this.rootSubscription, (err: Error) => {
        if (err) {
          throw new Error('mqtt subscription failed')
        }
      })
    })

    client.on('message', (topic, message) => {
      this.messageCallback && this.messageCallback(topic, message)
    })

    return this.stateMachine
  }

  public disconnect() {
    this.client && this.client.end()
  }
}
