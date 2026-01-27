import { MqttMessage } from 'MQTT-Explorer/events/events'
import { DataSourceStateMachine } from '.'

type MessageCallback = (topic: string, payload: Buffer, packet: any) => void

// A DataSource should automatically reconnect if connection was broken
interface DataSource<DataSourceOptions> {
  topicSeparator: string
  stateMachine: DataSourceStateMachine
  connect(options: DataSourceOptions): DataSourceStateMachine
  disconnect(): void
  onMessage(messageCallback: MessageCallback): void
  publish(msg: MqttMessage): void
}

export { DataSource, MessageCallback }
