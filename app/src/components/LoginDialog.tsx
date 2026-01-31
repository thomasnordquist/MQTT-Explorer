import * as React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material'

interface LoginDialogProps {
  open: boolean
  onLogin: (username: string, password: string) => void
  error?: string
  waitTimeSeconds?: number
}

export function LoginDialog(props: LoginDialogProps) {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [countdown, setCountdown] = React.useState<number | undefined>(props.waitTimeSeconds)

  // Update countdown when waitTimeSeconds prop changes
  React.useEffect(() => {
    setCountdown(props.waitTimeSeconds)
  }, [props.waitTimeSeconds])

  // Countdown timer
  React.useEffect(() => {
    if (countdown === undefined || countdown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === undefined || prev <= 1) {
          return undefined
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleLogin = () => {
    if (countdown !== undefined && countdown > 0) {
      // Don't allow login during countdown
      return
    }
    if (!username || !password) {
      // Don't allow empty credentials
      return
    }
    props.onLogin(username, password)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  const isDisabled = countdown !== undefined && countdown > 0

  return (
    <Dialog
      open={props.open}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          /* Allow closing only via escape if needed */
        }
      }}
    >
      <DialogTitle>Login to MQTT Explorer</DialogTitle>
      <DialogContent>
        {props.error && (
          <Typography color="error" style={{ marginBottom: 16 }}>
            {props.error}
          </Typography>
        )}
        {countdown !== undefined && countdown > 0 && (
          <Typography color="warning" style={{ marginBottom: 16, fontWeight: 'bold' }}>
            Please wait {countdown} seconds before trying again...
          </Typography>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isDisabled}
          required
          data-testid="username-input"
        />
        <TextField
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isDisabled}
          required
          data-testid="password-input"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogin} color="primary" variant="contained" disabled={isDisabled}>
          {isDisabled ? `Wait ${countdown}s` : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
