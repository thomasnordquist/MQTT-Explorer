import { Client, connect as mqttConnect } from 'mqtt'
import { DataSource } from './'

export class MqttSource implements DataSource {
  private client: Client | undefined
  private url: string
  private subscription: string
  public topicSeparator = '/'

  constructor({url, subscription}: {url: string, subscription: string}) {
    this.url = url
    this.subscription = subscription
  }

  public connect({
    readyCallback,
    messageCallback
  }: {
    readyCallback: () => void,
    messageCallback: (topic: string, message: Buffer) => void
  }) {
    const client = mqttConnect(this.url)
    this.client = client

    client.on('connect', () => {
      readyCallback()
      client.subscribe(this.subscription, (err: Error) => {
        if (err) {
          throw new Error('mqtt connection failed')
        }
      })
    })

    client.on('message', (topic, message) => {
      messageCallback(topic, message)
    })
  }

  public disconnect() {
    this.client && this.client.end()
  }
}
