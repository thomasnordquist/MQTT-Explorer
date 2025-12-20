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
    console.log('subscribing', subscribeEvent.topic)
    this.ipc.on(subscribeEvent.topic, (event: any, arg: any) => {
      const sender = event.sender as WebContents
      this.currentClient = sender
      
      // Track the client
      if (!this.clients.has(sender.id)) {
        this.clients.set(sender.id, sender)
        
        // Clean up when window is closed
        sender.once('destroyed', () => {
          console.log('WebContents destroyed:', sender.id)
          this.clients.delete(sender.id)
          
          // Clean up owned connections
          const ownedConnections = Array.from(this.connectionOwners.entries())
            .filter(([_, webContentsId]) => webContentsId === sender.id)
            .map(([connectionId]) => connectionId)
          
          ownedConnections.forEach(connectionId => {
            this.connectionOwners.delete(connectionId)
            console.log(`Removed connection ${connectionId} (window closed)`)
          })
        })
      }
      
      // Track connection ownership when a connection is added
      if (subscribeEvent.topic === 'connection/add/mqtt' && arg?.id) {
        this.connectionOwners.set(arg.id, sender.id)
        console.log(`Connection ${arg.id} owned by window ${sender.id}`)
      }
      
      // Remove connection ownership when a connection is removed
      if (subscribeEvent.topic === 'connection/remove' && typeof arg === 'string') {
        this.connectionOwners.delete(arg)
        console.log(`Connection ${arg} removed`)
      }
      
      callback(arg)
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    console.log('unsubscribeAll', event.topic)
    this.ipc.removeAllListeners(event.topic)
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented') // Todo: implement
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    const topic = event.topic
    
    // Check if this is an RPC response (contains /response/ in topic)
    const isRpcResponse = topic.includes('/response/')
    
    if (isRpcResponse && this.currentClient && !this.currentClient.isDestroyed()) {
      // RPC responses go only to the requesting client
      this.currentClient.send(topic, msg)
      return
    }
    
    // Check if this is a connection-specific event
    const connectionPatterns = [
      /^conn\/([^/]+)$/,              // conn/${connectionId}
      /^conn\/state\/([^/]+)$/,       // conn/state/${connectionId}
      /^conn\/publish\/([^/]+)$/,     // conn/publish/${connectionId}
    ]
    
    for (const pattern of connectionPatterns) {
      const match = topic.match(pattern)
      if (match) {
        const connectionId = match[1]
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
    
    // All other events go to all clients (or fallback if owner not found)
    this.clients.forEach(client => {
      if (!client.isDestroyed()) {
        client.send(topic, msg)
      }
    })
  }
}
