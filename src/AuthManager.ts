import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

export interface Credentials {
  username: string
  passwordHash: string
}

export class AuthManager {
  private credentialsPath: string

  private credentials: Credentials | undefined

  private skipAuth: boolean

  constructor(credentialsPath: string) {
    this.credentialsPath = credentialsPath
    this.skipAuth = process.env.MQTT_EXPLORER_SKIP_AUTH === 'true'
  }

  public isAuthDisabled(): boolean {
    return this.skipAuth
  }

  public async initialize(): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production'

    // Check if authentication is disabled
    if (this.skipAuth) {
      console.log('='.repeat(60))
      console.log('WARNING: Authentication is DISABLED')
      console.log('MQTT_EXPLORER_SKIP_AUTH=true')
      console.log('This should only be used behind a secure authentication proxy!')
      console.log('='.repeat(60))
      return
    }

    // Try to get credentials from environment variables
    const envUsername = process.env.MQTT_EXPLORER_USERNAME
    const envPassword = process.env.MQTT_EXPLORER_PASSWORD

    if (envUsername && envPassword) {
      // Use environment credentials
      if (!isProduction) {
        console.log('Using credentials from environment variables')
        console.log('Username:', envUsername)
      }
      this.credentials = {
        username: envUsername,
        passwordHash: await bcrypt.hash(envPassword, 10),
      }
      return
    }

    // Try to load from file
    if (fs.existsSync(this.credentialsPath)) {
      try {
        const data = fs.readFileSync(this.credentialsPath, 'utf8')
        this.credentials = JSON.parse(data)
        if (!isProduction && this.credentials) {
          console.log('Loaded credentials from', this.credentialsPath)
          console.log('Username:', this.credentials.username)
        }
        return
      } catch (error) {
        console.error('Failed to load credentials from file:', error)
      }
    }

    // Generate new credentials
    const username = `user-${uuidv4().substring(0, 8)}`
    const password = uuidv4()

    console.log('='.repeat(60))
    console.log('Generated new credentials:')
    console.log('Username:', username)
    console.log('Password:', password)
    console.log('='.repeat(60))
    console.log('Please save these credentials. They will be persisted to:')
    console.log(this.credentialsPath)
    console.log('='.repeat(60))
    console.log('IMPORTANT: In production, use environment variables:')
    console.log('export MQTT_EXPLORER_USERNAME=<username>')
    console.log('export MQTT_EXPLORER_PASSWORD=<password>')
    console.log('='.repeat(60))

    this.credentials = {
      username,
      passwordHash: await bcrypt.hash(password, 10),
    }

    // Save to file
    try {
      const dir = path.dirname(this.credentialsPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.credentialsPath, JSON.stringify(this.credentials, null, 2))
      console.log('Credentials saved successfully')
    } catch (error) {
      console.error('Failed to save credentials:', error)
    }
  }

  public async verifyCredentials(username: string, password: string): Promise<boolean> {
    if (!this.credentials) {
      return false
    }

    // Use constant-time comparison for username to prevent timing attacks
    const usernameMatch = crypto.timingSafeEqual(
      Buffer.from(username.padEnd(256, '\0')),
      Buffer.from(this.credentials.username.padEnd(256, '\0'))
    )

    if (!usernameMatch) {
      return false
    }

    return bcrypt.compare(password, this.credentials.passwordHash)
  }

  public getUsername(): string | undefined {
    return this.credentials?.username
  }
}
