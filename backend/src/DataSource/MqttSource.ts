import * as Url from 'url'

import { Client, connect as mqttConnect } from 'mqtt'
import { DataSource, DataSourceStateMachine } from './'
import { MqttMessage } from '../../../events'
import { Base64Message } from '../Model/Base64Message'

export interface MqttOptions {
  url: string
  username?: string
  password?: string
  tls: boolean
  certValidation: boolean
  clientId?: string
  subscriptions: Array<string>
  certificateAuthority?: string
}

export class MqttSource implements DataSource<MqttOptions> {
  public stateMachine: DataSourceStateMachine = new DataSourceStateMachine()
  private client: Client | undefined
  private messageCallback?: (topic: string, message: Buffer, packet: any) => void
  public topicSeparator = '/'

  public onMessage(messageCallback: (topic: string, message: Buffer, packet: any) => void) {
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
      rejectUnauthorized: options.certValidation,
      username: options.username,
      password: options.password,
      clientId: options.clientId,
      servername: options.tls ? url.host : undefined,
      ca: options.certificateAuthority ? Buffer.from(options.certificateAuthority, 'base64') : undefined,
    } as any)

    this.client = client

    client.on('error', (error: Error) => {
      console.log(error)
      this.stateMachine.setError(error)
    })

    client.on('close', () => {
      this.stateMachine.setConnected(false)
    })

    client.on('end', () => {
      this.stateMachine.setConnected(false)
    })

    client.on('reconnect', () => {
      this.stateMachine.setConnecting()
    })

    client.on('connect', () => {
      this.stateMachine.setConnected(true)
      options.subscriptions.forEach(subscription => {
        client.subscribe(subscription, (err: Error) => {
          if (err) {
            this.stateMachine.setError(err)
          }
        })
      })
    })

    client.on('message', (topic, message, packet) => {
      this.messageCallback && this.messageCallback(topic, message, packet)
    })

    return this.stateMachine
  }

  public publish(msg: MqttMessage) {
    if (this.client) {
      this.client.publish(msg.topic, msg.payload ? Base64Message.toUnicodeString(msg.payload) : '', {
        qos: msg.qos,
        retain: msg.retain,
      })
    }
  }

  public disconnect() {
    this.client && this.client.end()
  }
}
