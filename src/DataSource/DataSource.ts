type ReadyCallback = () => void
type MessageCallback = (topic: string, payload: Buffer) => void

interface DataSource {
  connect({readyCallback, messageCallback}: { readyCallback: ReadyCallback, messageCallback: MessageCallback }): void
  disconnect(): void
  topicSeparator: string
}

export { DataSource, ReadyCallback, MessageCallback }
