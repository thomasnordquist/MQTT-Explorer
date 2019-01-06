import { addMqttConnectionEvent, backendEvents, makeConnectionStateEvent, makeConnectionMessageEvent, AddMqttConnection } from '../../events'
import { MqttSource, DataSource } from './DataSource'

class ConnectionManager {
  private connections: {[s: string]: DataSource<any>} = {}

  public manageConnections() {
    backendEvents.subscribe(addMqttConnectionEvent, this.handleConnectionRequest)
  }

  private handleConnectionRequest = (event: AddMqttConnection) => {
    console.log(event)
    const connectionId = event.id
    const options = event.options
    const connection = new MqttSource()
    this.connections[connectionId] = connection

    connection.stateMachine.onUpdate.subscribe((state) => {
      backendEvents.emit(makeConnectionStateEvent(connectionId), state)
    })

    connection.connect(options)
    this.handleNewMessagesForConnection(connectionId, connection)
  }

  private handleNewMessagesForConnection(connectionId: string, connection: MqttSource) {
    const messageEvent = makeConnectionMessageEvent(connectionId)
    connection.onMessage((topic: string, payload: Buffer) => {
      let buffer = payload
      if (buffer.length > 10000) {
        buffer = buffer.slice(0, 10000)
      }
      backendEvents.emit(messageEvent, { topic, payload: buffer.toString('base64') })
    })
  }

  public removeConnection(hash: string) {
    const connection = this.connections[hash]
    connection.stateMachine
    connection.disconnect()
    delete this.connections[hash]
  }
}

const connectionManager = new ConnectionManager()
connectionManager.manageConnections()
