import * as React from 'react'
import { LoginDialog } from './LoginDialog'

interface BrowserAuthWrapperProps {
  children: React.ReactNode
}

const isBrowserMode =
  typeof window !== 'undefined' && (typeof process === 'undefined' || process.env?.BROWSER_MODE === 'true')

export function BrowserAuthWrapper(props: BrowserAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [loginError, setLoginError] = React.useState<string | undefined>()
  const [showLogin, setShowLogin] = React.useState(false)

  React.useEffect(() => {
    if (!isBrowserMode) {
      // Not in browser mode, skip authentication
      setIsAuthenticated(true)
      return
    }

    // Check if already authenticated
    const username = sessionStorage.getItem('mqtt-explorer-username')
    const password = sessionStorage.getItem('mqtt-explorer-password')

    if (username && password) {
      // Try to use stored credentials
      setIsAuthenticated(true)
    } else {
      // Show login dialog
      setShowLogin(true)
    }
  }, [])

  const handleLogin = async (username: string, password: string) => {
    try {
      // Store credentials in session storage
      sessionStorage.setItem('mqtt-explorer-username', username)
      sessionStorage.setItem('mqtt-explorer-password', password)

      // The socket will use these credentials on next connection
      setIsAuthenticated(true)
      setShowLogin(false)
      setLoginError(undefined)

      // Reload to reinitialize socket with new auth
      window.location.reload()
    } catch (error) {
      setLoginError('Login failed. Please check your credentials.')
    }
  }

  if (!isBrowserMode) {
    // Not in browser mode, render children directly
    return <>{props.children}</>
  }

  if (!isAuthenticated) {
    return <LoginDialog open={showLogin} onLogin={handleLogin} error={loginError} />
  }

  return <>{props.children}</>
}
