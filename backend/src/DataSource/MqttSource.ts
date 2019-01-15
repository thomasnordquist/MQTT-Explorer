import * as Url from 'url'

import { Client, connect as mqttConnect } from 'mqtt'
import { DataSource, DataSourceStateMachine } from './'

export interface MqttOptions {
  url: string
  username?: string
  password?: string
  tls: boolean
  certValidation: boolean
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

    const urlStr = options.tls ? options.url.replace(/^(mqtt|ws):/, '$1s:') : options.url
    let url
    try {
      url = Url.parse(urlStr)
    } catch (error) {
      this.stateMachine.setError(error)
      throw error
    }

    const client = mqttConnect(url, {
      resubscribe: false,
      rejectUnauthorized: !options.certValidation,
      username: options.username,
      password: options.password,
    })

    this.client = client

    client.on('error', (error: Error) => {
      console.log(error)
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

  public publish(topic: string, payload: any) {
    this.client && this.client.publish(topic, payload)
  }

  public disconnect() {
    this.client && this.client.end()
  }
}
