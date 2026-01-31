import { Server as SocketIOServer, Socket } from 'socket.io'
import Debug from 'debug'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'

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

  private clients: Map<string, Socket> = new Map() // socketId -> Socket

  // Global handlers that apply to ALL sockets (like RPC endpoints)
  private globalHandlers: Map<string, (socket: Socket, arg: any) => void> = new Map()

  // Per-socket subscriptions for cleanup
  private socketSubscriptions: Map<string, Array<SocketSubscription>> = new Map()

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
      this.clients.set(socket.id, socket)
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
        this.clients.delete(socket.id)
        this.logConnectionMetrics('disconnect', socket.id)
      })
    })
  }

  private logConnectionMetrics(event: 'connect' | 'disconnect', socketId: string) {
    const totalClients = this.clients.size
    const totalSubscriptions = Array.from(this.socketSubscriptions.values()).reduce((sum, subs) => sum + subs.length, 0)
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

  private registerHandlerOnSocket(socket: Socket, topic: string, handler: (socket: Socket, arg: any) => void) {
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
      debugSubscriptions('Removed %d subscriptions for socket %s', subscriptions.length, socket.id.substring(0, 8))
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
    this.clients.delete(socket.id)

    // Clear current socket if it was this one
    if (this.currentSocket === socket) {
      this.currentSocket = undefined
    }

    debugDisconnect('Cleanup complete for socket %s', socket.id.substring(0, 8))
  }

  public subscribe<MessageType>(subscribeEvent: Event<MessageType>, callback: (msg: MessageType) => void) {
    const handler = (socket: Socket, arg: any) => {
      this.currentSocket = socket
      callback(arg)
    }

    // Store as global handler
    this.globalHandlers.set(subscribeEvent.topic, handler)

    // Register on all currently connected clients
    this.clients.forEach(client => {
      this.registerHandlerOnSocket(client, subscribeEvent.topic, handler)
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    // Remove from global handlers
    this.globalHandlers.delete(event.topic)

    // Remove from all sockets
    this.clients.forEach(client => {
      const subscriptions = this.socketSubscriptions.get(client.id)
      if (subscriptions) {
        const toRemove = subscriptions.filter(s => s.topic === event.topic)
        toRemove.forEach(({ handler }) => {
          client.off(event.topic, handler)
        })

        // Update subscriptions list
        this.socketSubscriptions.set(
          client.id,
          subscriptions.filter(s => s.topic !== event.topic)
        )
      }
    })
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented - use unsubscribeAll instead')
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    const { topic } = event

    // Check if this is an RPC response (contains /response/ in topic)
    if (topic.includes('/response/')) {
      if (this.currentSocket && this.currentSocket.connected) {
        this.currentSocket.emit(topic, msg)
      }
      return
    }

    // Check if this is a connection-specific event - optimized with early pattern match
    // Patterns: conn/${connectionId}, conn/state/${connectionId}, conn/publish/${connectionId}
    if (topic.startsWith('conn/')) {
      const parts = topic.split('/')
      let connectionId: string | undefined

      if (parts.length === 2) {
        // conn/${connectionId}
        connectionId = parts[1]
      } else if (parts.length === 3 && (parts[1] === 'state' || parts[1] === 'publish')) {
        // conn/state/${connectionId} or conn/publish/${connectionId}
        connectionId = parts[2]
      }

      if (connectionId) {
        const ownerSocketId = this.connectionOwners.get(connectionId)
        if (ownerSocketId) {
          const ownerSocket = this.clients.get(ownerSocketId)
          if (ownerSocket && ownerSocket.connected) {
            ownerSocket.emit(topic, msg)
            return
          }
        }
      }
    }

    // All other events go to all clients
    this.io.emit(topic, msg)
  }
}
