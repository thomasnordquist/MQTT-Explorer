import * as React from 'react'
import { LoginDialog } from './LoginDialog'
import { updateSocketAuth, connectSocket } from '../browserEventBus'
import { isBrowserMode } from '../utils/browserMode'

interface BrowserAuthWrapperProps {
  children: React.ReactNode
}

export function BrowserAuthWrapper(props: BrowserAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [loginError, setLoginError] = React.useState<string | undefined>()
  const [showLogin, setShowLogin] = React.useState(false) // Changed: default to false until we check auth status
  const [waitTimeSeconds, setWaitTimeSeconds] = React.useState<number | undefined>()
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [authCheckComplete, setAuthCheckComplete] = React.useState(false)

  React.useEffect(() => {
    if (!isBrowserMode) {
      // Not in browser mode, skip authentication
      setIsAuthenticated(true)
      setAuthCheckComplete(true)
      return
    }

    // Check if authentication is disabled on the server
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/auth-status')
        const data = await response.json()
        
        if (data.authDisabled) {
          // Authentication is disabled, skip login
          console.log('Authentication is disabled on server, connecting without credentials')
          setIsAuthenticated(true)
          setShowLogin(false)
          setAuthCheckComplete(true)
          // Connect without auth
          connectSocket()
          return
        }
        
        // Authentication is enabled, proceed with normal flow
        setAuthCheckComplete(true)
        
        // Check if already authenticated
        const username = sessionStorage.getItem('mqtt-explorer-username')
        const password = sessionStorage.getItem('mqtt-explorer-password')

        if (username && password) {
          // Credentials exist, try to connect with them
          setIsConnecting(true)
          connectSocket()
        } else {
          // No credentials, show login dialog
          setShowLogin(true)
        }
      } catch (error) {
        console.error('Failed to check auth status:', error)
        // On error, assume auth is required and show login
        setAuthCheckComplete(true)
        setShowLogin(true)
      }
    }

    checkAuthStatus()

    // Listen for successful authentication from socket
    const handleAuthSuccess = (event: CustomEvent) => {
      console.log('Authentication successful')
      setIsAuthenticated(true)
      setShowLogin(false)
      setLoginError(undefined)
      setWaitTimeSeconds(undefined)
      setIsConnecting(false)
    }

    // Listen for authentication errors from socket
    const handleAuthError = (event: CustomEvent) => {
      const errorMessage = event.detail?.message || 'Authentication failed'
      console.error('Authentication error:', errorMessage)
      
      // Clear authentication state
      setIsAuthenticated(false)
      setShowLogin(true)
      setIsConnecting(false)
      
      // Extract wait time from error message (e.g., "Please wait 30 seconds")
      const waitTimeMatch = errorMessage.match(/(\d+)\s+seconds?/)
      if (waitTimeMatch) {
        const seconds = parseInt(waitTimeMatch[1], 10)
        // Add a few seconds margin to the countdown
        setWaitTimeSeconds(seconds + 3)
      } else {
        setWaitTimeSeconds(undefined)
      }
      
      // Set user-friendly error message based on error type
      // Error messages from server already include wait times
      if (errorMessage.includes('Too many failed authentication attempts')) {
        setLoginError(errorMessage)
      } else if (errorMessage.includes('Invalid credentials')) {
        setLoginError(errorMessage)
      } else if (errorMessage.includes('Authentication required')) {
        setLoginError('Please enter your username and password.')
        setWaitTimeSeconds(undefined)
      } else {
        setLoginError('Authentication failed. Please try again.')
        setWaitTimeSeconds(undefined)
      }
    }

    window.addEventListener('mqtt-auth-success', handleAuthSuccess as EventListener)
    window.addEventListener('mqtt-auth-error', handleAuthError as EventListener)

    return () => {
      window.removeEventListener('mqtt-auth-success', handleAuthSuccess as EventListener)
      window.removeEventListener('mqtt-auth-error', handleAuthError as EventListener)
    }
  }, [])

  const handleLogin = (username: string, password: string) => {
    try {
      // Clear any previous error
      setLoginError(undefined)
      setWaitTimeSeconds(undefined)
      setIsConnecting(true)
      
      // Update socket auth and reconnect (no page reload needed)
      updateSocketAuth(username, password)
    } catch (error) {
      console.error('Failed to update socket auth:', error)
      setLoginError('Failed to connect. Please try again.')
      setIsConnecting(false)
    }
  }

  if (!isBrowserMode) {
    // Not in browser mode, render children directly
    return <>{props.children}</>
  }

  // Show nothing while checking auth status to avoid flash
  if (!authCheckComplete) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginDialog open={showLogin} onLogin={handleLogin} error={loginError} waitTimeSeconds={waitTimeSeconds} />
  }

  return <>{props.children}</>
}
