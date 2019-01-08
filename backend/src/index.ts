import {
  addMqttConnectionEvent, backendEvents,
  makeConnectionStateEvent, removeConnection,
  makeConnectionMessageEvent, AddMqttConnection,
} from '../../events'
import { MqttSource, DataSource } from './DataSource'

class ConnectionManager {
  private connections: {[s: string]: DataSource<any>} = {}

  public manageConnections() {
    backendEvents.subscribe(addMqttConnectionEvent, this.handleConnectionRequest)
    backendEvents.subscribe(removeConnection, (connectionId: string) => this.removeConnection(connectionId))
  }

  private handleConnectionRequest = (event: AddMqttConnection) => {
    const connectionId = event.id
    const options = event.options
    const connection = new MqttSource()
    this.connections[connectionId] = connection

    const connectionStateEvent = makeConnectionStateEvent(connectionId)
    connection.stateMachine.onUpdate.subscribe((state) => {
      backendEvents.emit(connectionStateEvent, state)
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
    connection.disconnect()
    delete this.connections[hash]
  }
}

const connectionManager = new ConnectionManager()
connectionManager.manageConnections()
