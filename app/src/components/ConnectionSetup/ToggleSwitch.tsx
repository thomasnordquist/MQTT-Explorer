import React from 'react'
import { FormControlLabel, Switch } from '@mui/material'

export function ToggleSwitch(props: { value: boolean; classes: any; toggle: () => void; label: string }) {
  const { classes, value, toggle, label } = props
  const toggleSwitch = (
    <Switch
      checked={value}
      onChange={toggle}
      color="primary"
      role="switch"
      aria-checked={value}
      inputProps={{
        'aria-label': label,
      }}
    />
  )
  return (
    <div className={classes.switch}>
      <FormControlLabel control={toggleSwitch} label={`${label} (${value ? 'On' : 'Off'})`} labelPlacement="bottom" />
    </div>
  )
}
