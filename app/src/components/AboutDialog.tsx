import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Link,
  Avatar,
  Box,
  Divider,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { rendererRpc, getAppVersion } from '../eventBus'

// Fallback version if RPC call fails (e.g., in browser mode during initialization)
const FALLBACK_VERSION = '0.4.0-beta.5'

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
 * This component is licensed under Creative Commons Attribution-NoDerivatives 4.0 International.
 *
 * REQUIRED ATTRIBUTION:
 * - Author: Thomas Nordquist
 * - License: CC-BY-ND-4.0
 *
 * RESTRICTIONS:
 * - BY (Attribution): You must give appropriate credit to the author
 * - ND (NoDerivatives): You may not create derivative works without permission
 *
 * Removing or modifying this attribution violates the license terms.
 * For full license text: https://creativecommons.org/licenses/by-nd/4.0/legalcode
 */
export function AboutDialog(props: AboutDialogProps) {
  const [version, setVersion] = React.useState<string>(FALLBACK_VERSION)

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
        <Typography variant="body1" gutterBottom data-testid="about-license">
          <strong>License:</strong> CC-BY-ND-4.0
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> Explore your message queues
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
          data-testid="about-author"
        >
          <Avatar src="https://github.com/thomasnordquist.png" alt="Thomas Nordquist" sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Thomas Nordquist
            </Typography>
            <Link
              href="https://github.com/thomasnordquist"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'block', fontSize: '0.875rem' }}
            >
              @thomasnordquist
            </Link>
            <Link
              href="https://paypal.me/ThomasNordquist"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem',
                mt: 0.5,
              }}
            >
              <FavoriteIcon sx={{ fontSize: '1rem', color: 'error.main' }} />
              Support via PayPal
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

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
