import PowerSettingsNew from '@mui/icons-material/PowerSettingsNew'
import React from 'react'
import { Button } from '@mui/material'
import ConnectionHealthIndicator from '../helper/ConnectionHealthIndicator'

function ConnectButton(props: { connecting: boolean; classes: any; toggle: () => void }) {
  const { classes, toggle, connecting } = props

  if (connecting) {
    return (
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={toggle}
        data-testid="abort-button"
        aria-label="Cancel connection attempt"
      >
        <ConnectionHealthIndicator />
        &nbsp;&nbsp;Cancel
      </Button>
    )
  }

  return (
    <Button
      variant="contained"
      color="primary"
      className={classes.button}
      onClick={toggle}
      data-testid="connect-button"
      aria-label="Connect to MQTT broker"
    >
      <PowerSettingsNew /> Connect
    </Button>
  )
}

export default ConnectButton
