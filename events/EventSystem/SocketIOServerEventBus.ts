import { Server as SocketIOServer, Socket } from 'socket.io'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'
import Debug from 'debug'

const debug = Debug('mqtt-explorer:socketio')
const debugConnect = Debug('mqtt-explorer:socketio:connect')
const debugDisconnect = Debug('mqtt-explorer:socketio:disconnect')
const debugSubscriptions = Debug('mqtt-explorer:socketio:subscriptions')
const debugConnections = Debug('mqtt-explorer:socketio:connections')
const debugEmit = Debug('mqtt-explorer:socketio:emit')

interface SocketSubscription {
  topic: string
  handler: (arg: any) => void
}

export class SocketIOServerEventBus implements EventBusInterface {
  private io: SocketIOServer
  private clients: Set<Socket> = new Set()
  
  // Global handlers that apply to ALL sockets (like RPC endpoints)
  private globalHandlers: Map<string, (socket: Socket, arg: any) => void> = new Map()
  
  // Per-socket subscriptions for cleanup
  private socketSubscriptions: Map<string, SocketSubscription[]> = new Map()
  
  // Track which socket is currently processing a request
  private currentSocket: Socket | undefined
  
  // Map connectionId -> socketId to route messages to correct client
  private connectionOwners: Map<string, string> = new Map()
  
  // Track which connections to close when a socket disconnects
  private socketConnections: Map<string, Set<string>> = new Map()

  constructor(io: SocketIOServer) {
    this.io = io

    // Register connection handler once
    this.io.on('connection', socket => {
      debugConnect('Client connected: %s', socket.id)
      this.clients.add(socket)
      this.socketSubscriptions.set(socket.id, [])
      this.socketConnections.set(socket.id, new Set())

      // Register all global handlers on this socket
      this.globalHandlers.forEach((handler, topic) => {
        this.registerHandlerOnSocket(socket, topic, handler)
      })

      // Log connection metrics
      this.logConnectionMetrics('connect', socket.id)

      socket.on('disconnect', () => {
        debugDisconnect('Client disconnected: %s', socket.id)
        this.cleanupSocket(socket)
        this.logConnectionMetrics('disconnect', socket.id)
      })
    })
  }

  private logConnectionMetrics(event: 'connect' | 'disconnect', socketId: string) {
    const totalClients = this.clients.size
    const totalSubscriptions = Array.from(this.socketSubscriptions.values())
      .reduce((sum, subs) => sum + subs.length, 0)
    const totalConnections = this.connectionOwners.size
    const socketSubs = this.socketSubscriptions.get(socketId)?.length || 0
    const socketConns = this.socketConnections.get(socketId)?.size || 0
    
    debug(
      '[%s] clients=%d subscriptions=%d mqttConns=%d | socket[%s]: subs=%d conns=%d',
      event,
      totalClients,
      totalSubscriptions,
      totalConnections,
      socketId.substring(0, 8),
      socketSubs,
      socketConns
    )
    
    debugSubscriptions(
      'Total subscriptions: %d across %d sockets (avg: %d per socket)',
      totalSubscriptions,
      totalClients,
      totalClients > 0 ? Math.round(totalSubscriptions / totalClients) : 0
    )
    
    debugConnections(
      'MQTT connections: %d total, %d owned by socket %s',
      totalConnections,
      socketConns,
      socketId.substring(0, 8)
    )
  }

  private registerHandlerOnSocket(
    socket: Socket, 
    topic: string, 
    handler: (socket: Socket, arg: any) => void
  ) {
    const wrappedHandler = (arg: any) => {
      this.currentSocket = socket
      
      // Track connection ownership when a connection is added
      if (topic === 'connection/add/mqtt' && arg?.id) {
        this.connectionOwners.set(arg.id, socket.id)
        const socketConns = this.socketConnections.get(socket.id)
        if (socketConns) {
          socketConns.add(arg.id)
        }
        debugConnections(
          'Connection %s owned by socket %s (total: %d)',
          arg.id,
          socket.id.substring(0, 8),
          socketConns?.size || 0
        )
      }
      
      // Remove connection ownership when a connection is removed
      if (topic === 'connection/remove' && typeof arg === 'string') {
        this.connectionOwners.delete(arg)
        const socketConns = this.socketConnections.get(socket.id)
        if (socketConns) {
          socketConns.delete(arg)
        }
        debugConnections(
          'Connection %s removed (socket %s remaining: %d)',
          arg,
          socket.id.substring(0, 8),
          socketConns?.size || 0
        )
      }
      
      handler(socket, arg)
    }
    
    socket.on(topic, wrappedHandler)
    
    // Track subscription for cleanup
    const subscriptions = this.socketSubscriptions.get(socket.id)
    if (subscriptions) {
      subscriptions.push({ topic, handler: wrappedHandler })
    }
  }

  private cleanupSocket(socket: Socket) {
    debugDisconnect('Cleaning up socket %s', socket.id)
    
    // Remove all event listeners for this socket
    const subscriptions = this.socketSubscriptions.get(socket.id)
    if (subscriptions) {
      subscriptions.forEach(({ topic, handler }) => {
        socket.off(topic, handler)
      })
      this.socketSubscriptions.delete(socket.id)
      debugSubscriptions(
        'Removed %d subscriptions for socket %s',
        subscriptions.length,
        socket.id.substring(0, 8)
      )
    }
    
    // Close all MQTT connections owned by this socket
    const ownedConnections = this.socketConnections.get(socket.id)
    if (ownedConnections && ownedConnections.size > 0) {
      debugConnections(
        'Socket %s owned %d connections, requesting cleanup',
        socket.id.substring(0, 8),
        ownedConnections.size
      )
      
      // Emit connection/remove for each owned connection
      // This will be handled by ConnectionManager to actually close the MQTT connection
      ownedConnections.forEach(connectionId => {
        debugConnections('Auto-closing connection %s (owner disconnected)', connectionId)
        // Simulate a remove request from this socket
        const removeHandler = this.globalHandlers.get('connection/remove')
        if (removeHandler) {
          this.currentSocket = socket
          removeHandler(socket, connectionId)
        }
        this.connectionOwners.delete(connectionId)
      })
      
      this.socketConnections.delete(socket.id)
    }
    
    // Remove from clients set
    this.clients.delete(socket)
    
    // Clear current socket if it was this one
    if (this.currentSocket === socket) {
      this.currentSocket = undefined
    }
    
    debugDisconnect('Cleanup complete for socket %s', socket.id.substring(0, 8))
  }

  public subscribe<MessageType>(subscribeEvent: Event<MessageType>, callback: (msg: MessageType) => void) {
    debugSubscriptions('Global subscribe to topic: %s', subscribeEvent.topic)

    const handler = (socket: Socket, arg: any) => {
      this.currentSocket = socket
      callback(arg)
    }

    // Store as global handler
    this.globalHandlers.set(subscribeEvent.topic, handler)

    // Register on all currently connected clients
    const clientCount = this.clients.size
    this.clients.forEach(client => {
      this.registerHandlerOnSocket(client, subscribeEvent.topic, handler)
    })
    
    debugSubscriptions(
      'Registered handler for "%s" on %d clients',
      subscribeEvent.topic,
      clientCount
    )
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    debugSubscriptions('Unsubscribe all from topic: %s', event.topic)
    
    // Remove from global handlers
    this.globalHandlers.delete(event.topic)
    
    let totalRemoved = 0
    
    // Remove from all sockets
    this.clients.forEach(client => {
      const subscriptions = this.socketSubscriptions.get(client.id)
      if (subscriptions) {
        const toRemove = subscriptions.filter(s => s.topic === event.topic)
        toRemove.forEach(({ handler }) => {
          client.off(event.topic, handler)
          totalRemoved++
        })
        
        // Update subscriptions list
        this.socketSubscriptions.set(
          client.id,
          subscriptions.filter(s => s.topic !== event.topic)
        )
      }
    })
    
    debugSubscriptions(
      'Removed %d subscriptions for topic "%s" across %d clients',
      totalRemoved,
      event.topic,
      this.clients.size
    )
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented - use unsubscribeAll instead')
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    const topic = event.topic
    
    // Check if this is an RPC response (contains /response/ in topic)
    const isRpcResponse = topic.includes('/response/')
    
    if (isRpcResponse && this.currentSocket && this.currentSocket.connected) {
      // RPC responses go only to the requesting client
      debugEmit('Sending RPC response to socket %s: %s', this.currentSocket.id.substring(0, 8), topic)
      this.currentSocket.emit(topic, msg)
      return
    }
    
    // Check if this is a connection-specific event
    // Patterns to isolate per connection:
    // - conn/${connectionId} - incoming MQTT messages
    // - conn/state/${connectionId} - connection state changes
    // - conn/publish/${connectionId} - outgoing MQTT messages (subscriptions from backend)
    const connectionPatterns = [
      /^conn\/([^/]+)$/,              // conn/${connectionId}
      /^conn\/state\/([^/]+)$/,       // conn/state/${connectionId}
      /^conn\/publish\/([^/]+)$/,     // conn/publish/${connectionId}
    ]
    
    for (const pattern of connectionPatterns) {
      const match = topic.match(pattern)
      if (match) {
        const connectionId = match[1]
        const ownerSocketId = this.connectionOwners.get(connectionId)
        
        if (ownerSocketId) {
          // Send only to the socket that owns this connection
          const ownerSocket = Array.from(this.clients).find(s => s.id === ownerSocketId)
          if (ownerSocket && ownerSocket.connected) {
            debugEmit(
              'Sending connection event to owner socket %s: %s (conn: %s)',
              ownerSocketId.substring(0, 8),
              topic,
              connectionId
            )
            ownerSocket.emit(topic, msg)
            return
          } else {
            debugEmit(
              'Owner socket %s not found or disconnected for connection %s',
              ownerSocketId.substring(0, 8),
              connectionId
            )
          }
        } else {
          debugEmit('No owner found for connection %s (topic: %s)', connectionId, topic)
        }
      }
    }
    
    // All other events go to all clients (or fallback if owner not found)
    debugEmit('Broadcasting to all %d clients: %s', this.clients.size, topic)
    this.io.emit(topic, msg)
  }
}
