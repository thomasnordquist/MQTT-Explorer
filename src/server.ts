import express from 'express'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io'
import { promises as fsPromise } from 'fs'
import { Request, Response } from 'express'
import { AuthManager } from './AuthManager'
import { ConnectionManager } from '../backend/src/index'
import ConfigStorage from '../backend/src/ConfigStorage'
import { SocketIOServerEventBus } from '../events/EventSystem/SocketIOServerEventBus'
import { Rpc } from '../events/EventSystem/Rpc'
import { makeOpenDialogRpc, makeSaveDialogRpc } from '../events/OpenDialogRequest'
import { getAppVersion, writeToFile, readFromFile } from '../events'
import { RpcEvents } from '../events/EventsV2'

const PORT = process.env.PORT || 3000
const CREDENTIALS_PATH = path.join(process.cwd(), 'data', 'credentials.json')

async function startServer() {
  // Initialize authentication
  const authManager = new AuthManager(CREDENTIALS_PATH)
  await authManager.initialize()

  // Create Express app
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    allowEIO3: true, // Allow Engine.IO v3 clients (backwards compatibility)
    transports: ['websocket', 'polling'], // Support both transports
    pingTimeout: 60000, // Increase ping timeout
    pingInterval: 25000, // Ping interval
  })

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    const { username, password } = socket.handshake.auth

    if (!username || !password) {
      return next(new Error('Authentication required'))
    }

    const isValid = await authManager.verifyCredentials(username, password)
    if (!isValid) {
      return next(new Error('Invalid credentials'))
    }

    console.log('Client authenticated:', username)
    next()
  })

  // Initialize backend event bus with Socket.io
  const backendEvents = new SocketIOServerEventBus(io)
  const backendRpc = new Rpc(backendEvents)

  // Initialize connection manager
  const connectionManager = new ConnectionManager(backendEvents)
  connectionManager.manageConnections()

  // Initialize config storage
  const configStorage = new ConfigStorage(path.join(process.cwd(), 'data', 'settings.json'), backendRpc)
  configStorage.init()

  // Setup RPC handlers for file operations
  backendRpc.on(makeOpenDialogRpc(), async request => {
    // In browser mode, file selection is handled client-side via upload
    // Return empty result as this will be handled differently
    return { canceled: true, filePaths: [] }
  })

  backendRpc.on(makeSaveDialogRpc(), async request => {
    // In browser mode, file saving is handled client-side via download
    return { canceled: true, filePath: '' }
  })

  backendRpc.on(getAppVersion, async () => {
    // Return version from package.json
    try {
      const packageJsonPath = path.join(__dirname, '..', '..', 'package.json')
      const packageJsonData = await fsPromise.readFile(packageJsonPath, 'utf8')
      const packageJson = JSON.parse(packageJsonData)
      return packageJson.version
    } catch (e) {
      return '0.0.0'
    }
  })

  backendRpc.on(writeToFile, async ({ filePath, data, encoding }) => {
    // In browser mode, we store files in the server's data directory
    const dataDir = path.join(process.cwd(), 'data', 'uploads')
    const safePath = path.join(dataDir, path.basename(filePath))

    try {
      await fsPromise.mkdir(dataDir, { recursive: true })
      if (encoding) {
        await fsPromise.writeFile(safePath, Buffer.from(data, 'base64'), { encoding: encoding as BufferEncoding })
      } else {
        await fsPromise.writeFile(safePath, Buffer.from(data, 'base64'))
      }
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  })

  backendRpc.on(readFromFile, async ({ filePath, encoding }) => {
    // In browser mode, files are read from the server's data directory
    const dataDir = path.join(process.cwd(), 'data', 'uploads')
    const safePath = path.join(dataDir, path.basename(filePath))

    try {
      if (encoding) {
        const content = await fsPromise.readFile(safePath, { encoding: encoding as BufferEncoding })
        return Buffer.from(content)
      }
      return await fsPromise.readFile(safePath)
    } catch (error) {
      console.error('Error reading file:', error)
      throw error
    }
  })

  // Certificate upload handler - via IPC for consistency
  backendRpc.on(RpcEvents.uploadCertificate, async ({ filename, data }) => {
    // Store certificate on server for browser mode
    const dataDir = path.join(process.cwd(), 'data', 'certificates')
    await fsPromise.mkdir(dataDir, { recursive: true })

    const safePath = path.join(dataDir, path.basename(filename))
    await fsPromise.writeFile(safePath, Buffer.from(data, 'base64'))

    console.log('Certificate uploaded:', filename)

    // Return the certificate data for client to use
    return {
      name: filename,
      data,
    }
  })

  // Serve static files
  app.use(express.static(path.join(__dirname, '..', '..', 'app', 'build')))

  // Serve index.html for all other routes (SPA)
  app.use((req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', '..', 'app', 'index.html'))
  })

  // Start server
  server.listen(PORT, () => {
    console.log('='.repeat(60))
    console.log(`MQTT Explorer server running on http://localhost:${PORT}`)
    console.log('='.repeat(60))
  })

  // Handle graceful shutdown
  process.on('SIGTERM' as any, () => {
    console.log('SIGTERM received, closing connections...')
    connectionManager.closeAllConnections()
    server.close()
  })

  process.on('SIGINT' as any, () => {
    console.log('SIGINT received, closing connections...')
    connectionManager.closeAllConnections()
    server.close()
    process.exit(0)
  })
}

startServer().catch(error => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
