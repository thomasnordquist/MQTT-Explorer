import { Base64Message } from './Model/Base64Message'
import { DataSource, MqttSource } from './DataSource'
import {
  AddMqttConnection,
  MqttMessage,
  addMqttConnectionEvent,
  backendEvents,
  makeConnectionMessageEvent,
  makeConnectionStateEvent,
  makePublishEvent,
  removeConnection,
  setMaxMessageSize as setMaxMessageSizeEvent,
  MAX_MESSAGE_SIZE_DEFAULT,
  MAX_MESSAGE_SIZE_20KB,
  MAX_MESSAGE_SIZE_5MB,
  MAX_MESSAGE_SIZE_UNLIMITED,
} from '../../events'

export class ConnectionManager {
  private connections: { [s: string]: DataSource<any> } = {}
  private maxMessageSize: number = MAX_MESSAGE_SIZE_DEFAULT

  private handleConnectionRequest = (event: AddMqttConnection) => {
    const connectionId = event.id

    // Prevent double connections when reloading
    if (this.connections[connectionId]) {
      this.removeConnection(connectionId)
    }

    const options = event.options
    const connection = new MqttSource()
    this.connections[connectionId] = connection

    const connectionStateEvent = makeConnectionStateEvent(connectionId)
    connection.stateMachine.onUpdate.subscribe(state => {
      backendEvents.emit(connectionStateEvent, state)
    })

    connection.connect(options)
    this.handleNewMessagesForConnection(connectionId, connection)
    backendEvents.subscribe(makePublishEvent(connectionId), (msg: MqttMessage) => {
      this.connections[connectionId].publish(msg)
    })
  }

  private handleNewMessagesForConnection(connectionId: string, connection: MqttSource) {
    const messageEvent = makeConnectionMessageEvent(connectionId)
    connection.onMessage((topic: string, payload: Buffer, packet: any) => {
      let buffer = payload
      // Only apply limit if not unlimited
      if (this.maxMessageSize !== MAX_MESSAGE_SIZE_UNLIMITED && buffer.length > this.maxMessageSize) {
        buffer = buffer.slice(0, this.maxMessageSize)
      }

      let decoded_payload = null
      decoded_payload = Base64Message.fromBuffer(buffer)

      backendEvents.emit(messageEvent, {
        topic,
        payload: decoded_payload,
        qos: packet.qos,
        retain: packet.retain,
        messageId: packet.messageId,
      })
    })
  }

  public manageConnections() {
    backendEvents.subscribe(addMqttConnectionEvent, this.handleConnectionRequest)
    backendEvents.subscribe(removeConnection, (connectionId: string) => {
      this.removeConnection(connectionId)
    })
    backendEvents.subscribe(setMaxMessageSizeEvent, (maxMessageSize: number) => {
      // Validate the value is one of the allowed sizes
      const validSizes = [MAX_MESSAGE_SIZE_20KB, MAX_MESSAGE_SIZE_5MB, MAX_MESSAGE_SIZE_UNLIMITED]
      if (typeof maxMessageSize === 'number') {
        // Allow any positive number or unlimited
        if (maxMessageSize === MAX_MESSAGE_SIZE_UNLIMITED || maxMessageSize > 0) {
          this.maxMessageSize = maxMessageSize
        }
      }
    })
  }

  public removeConnection(connectionId: string) {
    const connection = this.connections[connectionId]
    if (connection) {
      backendEvents.unsubscribeAll(makePublishEvent(connectionId))
      connection.disconnect()
      delete this.connections[connectionId]
      connection.stateMachine.onUpdate.removeAllListeners()
    }
  }

  public closeAllConnections() {
    Object.keys(this.connections).forEach(connectionId => this.removeConnection(connectionId))
  }
}
