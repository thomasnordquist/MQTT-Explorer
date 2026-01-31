import * as React from 'react'
import { LoginDialog } from './LoginDialog'
import { updateSocketAuth, connectSocket } from '../browserEventBus'
import { isBrowserMode } from '../utils/browserMode'
import { AuthContext } from '../contexts/AuthContext'

interface BrowserAuthWrapperProps {
  children: React.ReactNode
}

export function BrowserAuthWrapper(props: BrowserAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [loginError, setLoginError] = React.useState<string | undefined>()
  const [showLogin, setShowLogin] = React.useState(false)
  const [waitTimeSeconds, setWaitTimeSeconds] = React.useState<number | undefined>()
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [authCheckComplete, setAuthCheckComplete] = React.useState(false)
  const [authDisabled, setAuthDisabled] = React.useState(false)

  React.useEffect(() => {
    if (!isBrowserMode) {
      // Not in browser mode, skip authentication
      setIsAuthenticated(true)
      setAuthCheckComplete(true)
      return
    }

    // Listen for auth status from socket connection
    const handleAuthStatus = (event: CustomEvent) => {
      const { authDisabled } = event.detail
      setAuthDisabled(authDisabled)

      if (authDisabled) {
        // Authentication is disabled on server
        console.log('Authentication is disabled on server, skipping login')
        setIsAuthenticated(true)
        setShowLogin(false)
        setAuthCheckComplete(true)
      } else {
        // Authentication is enabled, check if we have credentials
        setAuthCheckComplete(true)

        const username = sessionStorage.getItem('mqtt-explorer-username')
        const password = sessionStorage.getItem('mqtt-explorer-password')

        if (username && password) {
          // Credentials exist, connection will authenticate automatically
          setIsConnecting(true)
        } else {
          // No credentials, show login dialog
          setShowLogin(true)
        }
      }
    }

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

      // Mark auth check as complete - we now know auth is required
      setAuthCheckComplete(true)

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

    // Connect socket to trigger auth-status event
    connectSocket()

    window.addEventListener('mqtt-auth-status', handleAuthStatus as EventListener)
    window.addEventListener('mqtt-auth-success', handleAuthSuccess as EventListener)
    window.addEventListener('mqtt-auth-error', handleAuthError as EventListener)

    return () => {
      window.removeEventListener('mqtt-auth-status', handleAuthStatus as EventListener)
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

  return <AuthContext.Provider value={{ authDisabled }}>{props.children}</AuthContext.Provider>
}
