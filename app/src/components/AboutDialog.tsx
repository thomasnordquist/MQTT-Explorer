import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Link } from '@mui/material'
import { rendererRpc, getAppVersion } from '../../../events'

interface AboutDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * About Dialog Component
 * 
 * This component displays application information including version, author, and license.
 * 
 * LICENSE NOTICE (CC-BY-ND-4.0):
 * This component must retain the following attribution:
 * - Author: Thomas Nordquist
 * - License: CC-BY-ND-4.0
 * Removing or modifying this attribution violates the Creative Commons 
 * Attribution-NoDerivatives 4.0 International License.
 */
export function AboutDialog(props: AboutDialogProps) {
  const [version, setVersion] = React.useState<string>('0.4.0-beta.5')

  React.useEffect(() => {
    // Fetch version from backend
    rendererRpc
      .call(getAppVersion, undefined, 5000)
      .then(v => setVersion(v))
      .catch(() => {
        // Fallback to hardcoded version if RPC fails
        console.warn('Failed to fetch app version, using fallback')
      })
  }, [])

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle>About MQTT Explorer</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          <strong>Version:</strong> {version}
        </Typography>
        <Typography variant="body1" gutterBottom data-testid="about-author">
          <strong>Author:</strong> Thomas Nordquist
        </Typography>
        <Typography variant="body1" gutterBottom data-testid="about-license">
          <strong>License:</strong> CC-BY-ND-4.0
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> Explore your message queues
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Homepage:</strong>{' '}
          <Link href="https://thomasnordquist.github.io/MQTT-Explorer/" target="_blank" rel="noopener noreferrer">
            https://thomasnordquist.github.io/MQTT-Explorer/
          </Link>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Bug Report:</strong>{' '}
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
