import { DataSourceStateMachine } from './'
import { MqttMessage } from '../../../events'

type MessageCallback = (topic: string, payload: Buffer) => void

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
