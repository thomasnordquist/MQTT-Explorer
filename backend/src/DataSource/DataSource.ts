import { DataSourceStateMachine } from './'

type MessageCallback = (topic: string, payload: Buffer) => void

// A DataSource should automatically reconnect if connection was broken
interface DataSource<DataSourceOptions> {
  connect(options: DataSourceOptions): DataSourceStateMachine
  disconnect(): void
  onMessage(messageCallback: MessageCallback): void
  publish(topic: string, payload: any): void
  topicSeparator: string
  stateMachine: DataSourceStateMachine
}

export { DataSource, MessageCallback }
