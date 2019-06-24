import ConnectionHealthIndicator from '../helper/ConnectionHealthIndicator'
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew'
import React from 'react'
import { Button } from '@material-ui/core'

function ConnectButton(props: { connecting: boolean; classes: any; toggle: () => void }) {
  const { classes, toggle, connecting } = props

  if (connecting) {
    return (
      <Button variant="contained" color="primary" className={classes.button} onClick={toggle}>
        <ConnectionHealthIndicator />
        &nbsp;&nbsp;Abort
      </Button>
    )
  }

  return (
    <Button variant="contained" color="primary" className={classes.button} onClick={toggle}>
      <PowerSettingsNew /> Connect
    </Button>
  )
}

export default ConnectButton
