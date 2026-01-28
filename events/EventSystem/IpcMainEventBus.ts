import { IpcMain, WebContents } from 'electron'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'

export class IpcMainEventBus implements EventBusInterface {
  private ipc: IpcMain

  private clients: Map<number, WebContents> = new Map() // webContentsId -> WebContents

  private connectionOwners: Map<string, number> = new Map() // connectionId -> webContentsId

  private currentClient: WebContents | undefined

  constructor(ipc: IpcMain) {
    this.ipc = ipc
  }

  public subscribe<MessageType>(subscribeEvent: Event<MessageType>, callback: (msg: MessageType) => void) {
    this.ipc.on(subscribeEvent.topic, (event: any, arg: any) => {
      const sender = event.sender as WebContents
      this.currentClient = sender

      // Track the client (O(1) operation)
      if (!this.clients.has(sender.id)) {
        this.clients.set(sender.id, sender)

        // Clean up when window is closed
        sender.once('destroyed', () => {
          this.clients.delete(sender.id)

          // Clean up owned connections
          Array.from(this.connectionOwners.entries()).forEach(([connectionId, webContentsId]) => {
            if (webContentsId === sender.id) {
              this.connectionOwners.delete(connectionId)
            }
          })
        })
      }

      // Track connection ownership
      if (subscribeEvent.topic === 'connection/add/mqtt' && arg?.id) {
        this.connectionOwners.set(arg.id, sender.id)
      }

      // Remove connection ownership
      if (subscribeEvent.topic === 'connection/remove' && typeof arg === 'string') {
        this.connectionOwners.delete(arg)
      }

      callback(arg)
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    this.ipc.removeAllListeners(event.topic)
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented') // Todo: implement
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    const { topic } = event

    // RPC responses go only to the requesting client
    if (topic.includes('/response/')) {
      if (this.currentClient && !this.currentClient.isDestroyed()) {
        this.currentClient.send(topic, msg)
      }
      return
    }

    // Connection-specific events - optimized with early pattern match
    if (topic.startsWith('conn/')) {
      const parts = topic.split('/')
      let connectionId: string | undefined

      if (parts.length === 2) {
        connectionId = parts[1]
      } else if (parts.length === 3 && (parts[1] === 'state' || parts[1] === 'publish')) {
        connectionId = parts[2]
      }

      if (connectionId) {
        const ownerWebContentsId = this.connectionOwners.get(connectionId)
        if (ownerWebContentsId !== undefined) {
          const ownerClient = this.clients.get(ownerWebContentsId)
          if (ownerClient && !ownerClient.isDestroyed()) {
            ownerClient.send(topic, msg)
            return
          }
        }
      }
    }

    // All other events go to all clients
    this.clients.forEach(client => {
      if (!client.isDestroyed()) {
        client.send(topic, msg)
      }
    })
  }
}
