import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Link } from '@mui/material'

const packageJson = require('../../../package.json')

interface AboutDialogProps {
  open: boolean
  onClose: () => void
}

export function AboutDialog(props: AboutDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle>About MQTT Explorer</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          <strong>Version:</strong> {packageJson.version}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Author:</strong> {packageJson.author}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>License:</strong> {packageJson.license}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> {packageJson.description}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Homepage:</strong>{' '}
          <Link href="https://thomasnordquist.github.io/MQTT-Explorer/" target="_blank" rel="noopener noreferrer">
            https://thomasnordquist.github.io/MQTT-Explorer/
          </Link>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Report Issues:</strong>{' '}
          <Link
            href="https://github.com/thomasnordquist/MQTT-Explorer/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/thomasnordquist/MQTT-Explorer/issues
          </Link>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
