export type ConnnectionOptions = MqttOptions | any

export interface MqttOptions {
  type: 'mqtt'
  url: string
  username?: string
  password?: string
  tls: boolean
  certValidation: boolean
  clientId?: string
  subscriptions: string[]
}