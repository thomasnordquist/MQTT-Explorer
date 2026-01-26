import express, { Request, Response } from 'express'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io'
import { promises as fsPromise } from 'fs'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'
import { AuthManager } from './AuthManager'
import { ConnectionManager } from '../backend/src/index'
import ConfigStorage from '../backend/src/ConfigStorage'
import { SocketIOServerEventBus } from '../events/EventSystem/SocketIOServerEventBus'
import { Rpc } from '../events/EventSystem/Rpc'
import { makeOpenDialogRpc, makeSaveDialogRpc } from '../events/OpenDialogRequest'
import { getAppVersion, writeToFile, readFromFile, addMqttConnectionEvent } from '../events'
import { RpcEvents } from '../events/EventsV2'

const PORT = process.env.PORT || 3000
const CREDENTIALS_PATH = path.join(process.cwd(), 'data', 'credentials.json')
const MAX_FILE_SIZE = 16 * 1024 * 1024 // 16MB limit for file uploads
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*']
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Validates and sanitizes file paths to prevent path traversal attacks
 * @param filename The filename to validate
 * @returns Sanitized filename or throws error if invalid
 */
function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename')
  }

  // Remove any path separators and null bytes
  const sanitized = filename.replace(/[/\\]/g, '').replace(/\0/g, '')

  // Check for directory traversal patterns
  if (sanitized.includes('..') || sanitized.startsWith('.')) {
    throw new Error('Invalid filename: directory traversal not allowed')
  }

  // Ensure filename is not empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid filename: empty after sanitization')
  }

  // Limit filename length
  if (sanitized.length > 255) {
    throw new Error('Filename too long')
  }

  return sanitized
}

/**
 * Validates that a path is within an allowed directory
 * @param targetPath The path to validate
 * @param allowedDir The allowed base directory
 * @returns True if path is safe, false otherwise
 */
async function isPathSafe(targetPath: string, allowedDir: string): Promise<boolean> {
  const fs = await import('fs')
  const realTargetPath = await fs.promises.realpath(targetPath).catch(() => targetPath)
  const realAllowedDir = await fs.promises.realpath(allowedDir).catch(() => allowedDir)
  return realTargetPath.startsWith(realAllowedDir)
}

async function startServer() {
  // Initialize authentication
  const authManager = new AuthManager(CREDENTIALS_PATH)
  await authManager.initialize()

  // Create Express app
  const app = express()

  // Apply security headers with helmet
  // Note: Despite disabling 4 advanced isolation features (designed for HTTPS-only environments),
  // Helmet still provides significant security value by setting 8+ important headers:
  // - Content-Security-Policy (customized to prevent XSS/injection)
  // - X-Frame-Options: SAMEORIGIN (prevents clickjacking)
  // - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  // - Referrer-Policy: no-referrer (protects privacy)
  // - X-DNS-Prefetch-Control: off (reduces privacy leaks)
  // - X-Download-Options: noopen (IE protection)
  // - X-Permitted-Cross-Domain-Policies: none (Flash/PDF protection)
  // - Removes X-Powered-By header (reduces fingerprinting)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval required for webpack runtime
          styleSrc: ["'self'", "'unsafe-inline'"], // Required for Material-UI
          connectSrc: ["'self'", 'ws:', 'wss:'], // Allow WebSocket connections
          imgSrc: ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: isProduction ? [] : null, // Only upgrade in production with HTTPS
        },
      },
      hsts: isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
      // Disable cross-origin policies that cause blank pages when accessing via IP vs localhost
      // These headers can block resources and cause rendering issues on HTTP-only deployments
      crossOriginEmbedderPolicy: false, // Can block resources without proper CORP headers
      crossOriginOpenerPolicy: false, // Can cause blank pages and window isolation issues
      crossOriginResourcePolicy: false, // Can block cross-origin resource loading
      originAgentCluster: false, // Causes issues when switching between localhost and IP address origins
    })
  )

  // Rate limiting for authentication attempts
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  })

  const server = http.createServer(app)

  // Determine allowed origins for CORS
  const corsOrigin =
    ALLOWED_ORIGINS[0] === '*' && isProduction
      ? false // In production, require explicit origins
      : ALLOWED_ORIGINS[0] === '*'
        ? '*'
        : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
              callback(null, true)
            } else {
              callback(new Error('Not allowed by CORS'))
            }
          }

  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    allowEIO3: true, // Allow Engine.IO v3 clients (backwards compatibility)
    transports: ['websocket', 'polling'], // Support both transports
    pingTimeout: 60000, // Increase ping timeout
    pingInterval: 25000, // Ping interval
    maxHttpBufferSize: MAX_FILE_SIZE, // Limit message size
  })

  // Track failed authentication attempts per IP with exponential back-off
  const failedAttempts = new Map<string, { count: number; lastAttempt: number }>()

  /**
   * Calculate exponential back-off wait time based on failed attempts
   * @param attemptCount Number of failed attempts
   * @returns Wait time in milliseconds
   */
  function calculateBackoffTime(attemptCount: number): number {
    // Progressive back-off with longer delays
    // Attempt 1: 5 seconds
    // Attempt 2: 10 seconds
    // Attempt 3: 30 seconds
    // Attempt 4: 60 seconds (1 minute)
    // Attempt 5: 120 seconds (2 minutes)
    // Attempt 6: 300 seconds (5 minutes)
    // Attempt 7+: 900 seconds (15 minutes, capped)
    const backoffSequence = [5, 10, 30, 60, 120, 300, 900]
    const index = Math.min(attemptCount - 1, backoffSequence.length - 1)
    return backoffSequence[index] * 1000
  }

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    // Skip authentication if disabled
    if (authManager.isAuthDisabled()) {
      if (!isProduction) {
        console.log('Client connected without authentication (auth disabled)')
      }
      // Mark socket as auth-disabled for later identification
      ;(socket as any).authDisabled = true
      return next()
    }

    const { username, password } = socket.handshake.auth
    const clientIp = socket.handshake.address

    // Check rate limiting per IP
    const now = Date.now()
    const attempts = failedAttempts.get(clientIp) || { count: 0, lastAttempt: 0 }

    // Calculate back-off time based on previous failed attempts
    if (attempts.count > 0) {
      const backoffTime = calculateBackoffTime(attempts.count)
      const timeSinceLastAttempt = now - attempts.lastAttempt
      const remainingWaitTime = backoffTime - timeSinceLastAttempt

      if (remainingWaitTime > 0) {
        const secondsRemaining = Math.ceil(remainingWaitTime / 1000)
        return next(new Error(`Too many failed authentication attempts. Please wait ${secondsRemaining} seconds before trying again.`))
      }
    }

    if (!username || !password) {
      attempts.count++
      attempts.lastAttempt = now
      failedAttempts.set(clientIp, attempts)
      return next(new Error('Authentication required'))
    }

    const isValid = await authManager.verifyCredentials(username, password)
    if (!isValid) {
      attempts.count++
      attempts.lastAttempt = now
      failedAttempts.set(clientIp, attempts)
      
      // Calculate next wait time for informational purposes
      const nextBackoff = calculateBackoffTime(attempts.count)
      const nextWaitSeconds = Math.ceil(nextBackoff / 1000)
      
      return next(new Error(`Invalid credentials. Next attempt allowed in ${nextWaitSeconds} seconds.`))
    }

    // Reset failed attempts on successful auth
    failedAttempts.delete(clientIp)

    if (!isProduction) {
      console.log('Client authenticated:', username)
    }
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

  // Send auth status to clients on connection
  io.on('connection', (socket) => {
    // Inform client about auth status
    const authDisabled = (socket as any).authDisabled === true
    socket.emit('auth-status', { authDisabled })
    
    if (!isProduction) {
      console.log(`Client connected, auth disabled: ${authDisabled}`)
    }
    
    // Auto-connect to MQTT broker if configured via environment variables
    const autoConnectHost = process.env.MQTT_AUTO_CONNECT_HOST
    if (autoConnectHost) {
      const connectionId = 'auto-connect-' + Date.now()
      
      // Notify client immediately that auto-connect will happen
      socket.emit('auto-connect-initiated', { connectionId })
      
      // Delay auto-connect to give client time to subscribe to events
      setTimeout(() => {
        const protocol = process.env.MQTT_AUTO_CONNECT_PROTOCOL || 'mqtt'
        const port = parseInt(process.env.MQTT_AUTO_CONNECT_PORT || '1883')
        const tls = protocol.endsWith('s') // mqtts or wss
        const url = `${protocol}://${autoConnectHost}:${port}`
        
        const autoConnectConfig = {
          id: connectionId,
          options: {
            url,
            username: process.env.MQTT_AUTO_CONNECT_USERNAME,
            password: process.env.MQTT_AUTO_CONNECT_PASSWORD,
            tls,
            certValidation: false,
            clientId: process.env.MQTT_AUTO_CONNECT_CLIENT_ID || 'mqtt-explorer-' + Math.random().toString(16).substr(2, 8),
            subscriptions: [{ topic: '#', qos: 0 as 0 | 1 | 2 }], // Subscribe to all topics
          }
        }
        
        if (!isProduction) {
          console.log('Auto-connecting to MQTT broker:', {
            connectionId,
            url: autoConnectConfig.options.url,
            clientId: autoConnectConfig.options.clientId,
            username: autoConnectConfig.options.username || '(none)',
          })
        }
        
        // Trigger connection via backend events
        backendEvents.emit(addMqttConnectionEvent, autoConnectConfig)
      }, 1000) // 1 second delay to allow client to set up event subscriptions
    }
  })

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

    try {
      // Validate filename to prevent path traversal
      const sanitizedFilename = sanitizeFilename(path.basename(filePath))
      const safePath = path.join(dataDir, sanitizedFilename)

      // Ensure data directory exists
      await fsPromise.mkdir(dataDir, { recursive: true })

      // Verify the final path is within the allowed directory
      if (!(await isPathSafe(safePath, dataDir))) {
        throw new Error('Invalid file path')
      }

      // Validate data size
      const dataBuffer = Buffer.from(data, 'base64')
      if (dataBuffer.length > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`)
      }

      // Write file
      if (encoding) {
        await fsPromise.writeFile(safePath, dataBuffer, { encoding: encoding as BufferEncoding })
      } else {
        await fsPromise.writeFile(safePath, dataBuffer)
      }
    } catch (error) {
      console.error('Error writing file:', error instanceof Error ? error.message : 'Unknown error')
      throw new Error('Failed to write file')
    }
  })

  backendRpc.on(readFromFile, async ({ filePath, encoding }) => {
    // In browser mode, files are read from the server's data directory
    const dataDir = path.join(process.cwd(), 'data', 'uploads')

    try {
      // Validate filename to prevent path traversal
      const sanitizedFilename = sanitizeFilename(path.basename(filePath))
      const safePath = path.join(dataDir, sanitizedFilename)

      // Verify the final path is within the allowed directory
      if (!(await isPathSafe(safePath, dataDir))) {
        throw new Error('Invalid file path')
      }

      // Read file
      if (encoding) {
        const content = await fsPromise.readFile(safePath, { encoding: encoding as BufferEncoding })
        return Buffer.from(content)
      }
      return await fsPromise.readFile(safePath)
    } catch (error) {
      console.error('Error reading file:', error instanceof Error ? error.message : 'Unknown error')
      throw new Error('Failed to read file')
    }
  })

  // Certificate upload handler - via IPC for consistency
  backendRpc.on(RpcEvents.uploadCertificate, async ({ filename, data }) => {
    try {
      // Validate filename to prevent path traversal
      const sanitizedFilename = sanitizeFilename(filename)

      // Validate data size
      const dataBuffer = Buffer.from(data, 'base64')
      if (dataBuffer.length > MAX_FILE_SIZE) {
        throw new Error(`Certificate size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`)
      }

      // Store certificate on server for browser mode
      const dataDir = path.join(process.cwd(), 'data', 'certificates')
      await fsPromise.mkdir(dataDir, { recursive: true })

      const safePath = path.join(dataDir, sanitizedFilename)

      // Verify the final path is within the allowed directory
      if (!(await isPathSafe(safePath, dataDir))) {
        throw new Error('Invalid certificate path')
      }

      await fsPromise.writeFile(safePath, dataBuffer)

      if (!isProduction) {
        console.log('Certificate uploaded:', sanitizedFilename)
      }

      // Return the certificate data for client to use
      return {
        name: sanitizedFilename,
        data,
      }
    } catch (error) {
      console.error('Error uploading certificate:', error instanceof Error ? error.message : 'Unknown error')
      throw new Error('Failed to upload certificate')
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
