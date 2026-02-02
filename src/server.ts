import express, { Request, Response } from 'express'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io'
import { promises as fsPromise } from 'fs'
import { inspect } from 'util'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'
import { LLMApiClient } from '../backend/src/llmApiClient'
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
// Enable upgrade-insecure-requests only when behind HTTPS reverse proxy
const enableUpgradeInsecure = process.env.UPGRADE_INSECURE_REQUESTS === 'true'
// Enable X-Frame-Options header to prevent iframe embedding (disabled by default)
const enableXFrameOptions = process.env.X_FRAME_OPTIONS === 'true'

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
  // Get Helmet's default CSP directives and remove upgrade-insecure-requests
  // This ensures the directive is never added, even in edge cases
  // Create a copy to avoid mutating Helmet's defaults
  const defaultCspDirectives = { ...helmet.contentSecurityPolicy.getDefaultDirectives() }
  delete defaultCspDirectives['upgrade-insecure-requests']

  // Build custom CSP directives, overriding defaults as needed
  const cspDirectives = {
    ...defaultCspDirectives,
    // Override default-src from defaults
    'default-src': ["'self'"],
    // Override script-src for webpack
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval required for webpack runtime
    // Override style-src for Material-UI
    'style-src': ["'self'", "'unsafe-inline'"], // Required for Material-UI
    // Add WebSocket support
    'connect-src': ["'self'", 'ws:', 'wss:'], // Allow WebSocket connections
    // Allow data URIs for images
    'img-src': ["'self'", 'data:', 'blob:'],
    // Only add upgrade-insecure-requests if explicitly enabled via env var
    ...(enableUpgradeInsecure && { 'upgrade-insecure-requests': [] }),
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false, // Don't merge with Helmet's defaults to ensure full control
        directives: cspDirectives,
      },
      hsts: isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
      frameguard: enableXFrameOptions ? { action: 'sameorigin' } : false, // Disabled by default to allow iframe embedding
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
        return next(
          new Error(
            `Too many failed authentication attempts. Please wait ${secondsRemaining} seconds before trying again.`
          )
        )
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
  io.on('connection', socket => {
    // Inform client about auth status
    const authDisabled = (socket as any).authDisabled === true
    socket.emit('auth-status', { authDisabled })

    if (!isProduction) {
      console.log(`Client connected, auth disabled: ${authDisabled}`)
    }

    // Send LLM availability status to clients (don't leak credentials)
    const llmAvailable = !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY)

    if (llmAvailable) {
      socket.emit('llm-available', { available: true })

      if (!isProduction) {
        console.log('LLM service is available on backend')
      }
    }

    // Auto-connect to MQTT broker if configured via environment variables
    const autoConnectHost = process.env.MQTT_AUTO_CONNECT_HOST
    if (autoConnectHost) {
      const connectionId = `auto-connect-${Date.now()}`

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
            clientId:
              process.env.MQTT_AUTO_CONNECT_CLIENT_ID || `mqtt-explorer-${Math.random().toString(16).substr(2, 8)}`,
            subscriptions: [{ topic: '#', qos: 0 as 0 | 1 | 2 }], // Subscribe to all topics
          },
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
  backendRpc.on(makeOpenDialogRpc(), async request =>
    // In browser mode, file selection is handled client-side via upload
    // Return empty result as this will be handled differently
    ({ canceled: true, filePaths: [] })
  )

  backendRpc.on(makeSaveDialogRpc(), async request =>
    // In browser mode, file saving is handled client-side via download
    ({ canceled: true, filePath: '' })
  )

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

  // LLM Chat RPC handler - proxies requests to LLM providers via WebSocket
  backendRpc.on(RpcEvents.llmChat, async ({ messages, topicContext, toolResults }) => {
    try {
      // Log received parameters
      console.log('\n' + '='.repeat(80))
      console.log('LLM RPC HANDLER - Received Request')
      console.log('='.repeat(80))
      console.log('Messages count:', messages?.length || 0)
      console.log('Topic context provided:', !!topicContext)
      console.log('Tool results provided:', !!toolResults)
      if (topicContext) {
        console.log('Topic context length:', topicContext.length, 'characters')
        console.log('Topic context preview:', topicContext.substring(0, 200) + '...')
      }
      
      // Log the last user message to verify context is included
      const lastUserMessage = messages?.filter((m: any) => m.role === 'user').slice(-1)[0]
      if (lastUserMessage) {
        console.log('\nLast user message:')
        console.log('Content length:', lastUserMessage.content.length, 'characters')
        console.log('Content starts with "Context:"?', lastUserMessage.content.startsWith('Context:'))
        console.log('Content preview:', lastUserMessage.content.substring(0, 500))
      }
      console.log('='.repeat(80) + '\n')
      
      // Get LLM configuration from environment
      const envProvider = process.env.LLM_PROVIDER as 'openai' | 'gemini' | undefined
      const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY

      if (!apiKey) {
        throw new Error('LLM service not configured')
      }

      if (!messages || !Array.isArray(messages)) {
        throw new Error('Invalid request: messages required')
      }

      // Note: Tool results are now added by the frontend to the conversation history
      // The toolResults parameter is kept for backwards compatibility but not used
      // The messages array already contains tool messages when tool execution happens

      // Define available tools for LLM
      const tools = [
        {
          type: 'function' as const,
          function: {
            name: 'query_topic_history',
            description: 'Get recent message history for a specific MQTT topic. Use this when you need to see historical values or patterns in the data.',
            parameters: {
              type: 'object' as const,
              properties: {
                topic: {
                  type: 'string',
                  description: 'The MQTT topic path to query (e.g., "zigbee2mqtt/bedroom/lamp")',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of messages to return (default 10, max 20)',
                },
              },
              required: ['topic'],
            },
          },
        },
        {
          type: 'function' as const,
          function: {
            name: 'get_topic',
            description: 'Get detailed information about a specific MQTT topic including its current value, message count, and metadata.',
            parameters: {
              type: 'object' as const,
              properties: {
                topic: {
                  type: 'string',
                  description: 'The MQTT topic path to query',
                },
              },
              required: ['topic'],
            },
          },
        },
        {
          type: 'function' as const,
          function: {
            name: 'list_children',
            description: 'List all child topics (sub-topics) under a given MQTT topic path. Useful for exploring topic hierarchy.',
            parameters: {
              type: 'object' as const,
              properties: {
                topic: {
                  type: 'string',
                  description: 'The parent MQTT topic path (use empty string for root topics)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of children to return (default 20, max 50)',
                },
              },
              required: ['topic'],
            },
          },
        },
        {
          type: 'function' as const,
          function: {
            name: 'list_parents',
            description: 'Get the parent topic path hierarchy for a given MQTT topic. Shows the topic tree structure from root to the specified topic.',
            parameters: {
              type: 'object' as const,
              properties: {
                topic: {
                  type: 'string',
                  description: 'The MQTT topic path to get parents for',
                },
              },
              required: ['topic'],
            },
          },
        },
      ]

      // Create LLM client with shared logic
      const llmClient = new LLMApiClient({
        apiKey,
        provider: envProvider,
        maxTokens: 1000,
        tools,
      })

      // Log request details
      console.log('LLM Provider:', (llmClient as any).provider)
      console.log('LLM Model:', (llmClient as any).model)
      console.log('='.repeat(80) + '\n')

      const startTime = Date.now()
      
      // Call LLM API using shared client
      const apiResponse = await llmClient.chat(messages)
      
      const endTime = Date.now()

      // Log response
      console.log('\n' + '='.repeat(80))
      console.log('LLM RESPONSE')
      console.log('='.repeat(80))
      console.log('Duration:', endTime - startTime, 'ms')
      console.log('Provider:', apiResponse.provider)
      console.log('Model:', apiResponse.model)
      console.log('Content length:', apiResponse.content.length)
      if (apiResponse.usage) {
        console.log('Usage:', apiResponse.usage)
      }
      console.log('='.repeat(80) + '\n')

      // Prepare debug info
      const debugInfo = {
        provider: apiResponse.provider,
        model: apiResponse.model,
        request: {
          url: apiResponse.provider === 'openai' 
            ? 'https://api.openai.com/v1/chat/completions'
            : `https://generativelanguage.googleapis.com/v1beta/models/${apiResponse.model}:generateContent`,
          messageCount: messages.length,
        },
        response: {
          contentLength: apiResponse.content.length,
          usage: apiResponse.usage,
        },
        timing: {
          duration_ms: endTime - startTime,
          timestamp: new Date().toISOString(),
        },
      }

      // Return the response with debug info
      console.log('\n' + '='.repeat(80))
      console.log('LLM RPC HANDLER - Returning response')
      console.log('='.repeat(80))
      console.log('Response length:', apiResponse.content.length)
      console.log('Has debugInfo:', true)
      console.log('='.repeat(80) + '\n')
      
      return {
        response: apiResponse.content,
        toolCalls: apiResponse.toolCalls,
        debugInfo,
      }
    } catch (error: any) {
      console.error('\n' + '='.repeat(80))
      console.error('LLM RPC ERROR')
      console.error('='.repeat(80))
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Full error:', inspect(error, { depth: null, colors: true }))
      console.error('='.repeat(80) + '\n')

      // Handle API errors
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('Invalid API key')) {
        throw new Error('Invalid API key configuration')
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timeout. Please try again.')
      } else {
        throw new Error(error.message || 'Failed to get response from LLM service')
      }
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
