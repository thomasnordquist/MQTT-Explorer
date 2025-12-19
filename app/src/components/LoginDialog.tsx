import * as React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@material-ui/core'

interface LoginDialogProps {
  open: boolean
  onLogin: (username: string, password: string) => void
  error?: string
}

export function LoginDialog(props: LoginDialogProps) {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    props.onLogin(username, password)
  }

  return (
    <Dialog open={props.open} disableEscapeKeyDown disableBackdropClick>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Login to MQTT Explorer</DialogTitle>
        <DialogContent>
          {props.error && (
            <Typography color="error" style={{ marginBottom: 16 }}>
              {props.error}
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
            required
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" color="primary" variant="contained">
            Login
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
