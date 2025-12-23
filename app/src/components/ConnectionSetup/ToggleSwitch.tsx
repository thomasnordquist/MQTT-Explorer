import React from 'react'
import { FormControlLabel, Switch } from '@mui/material'

export function ToggleSwitch(props: { value: boolean; classes: any; toggle: () => void; label: string }) {
  const { classes, value, toggle, label } = props
  const toggleSwitch = <Switch checked={value} onChange={toggle} color="primary" />
  return (
    <div className={classes.switch}>
      <FormControlLabel control={toggleSwitch} label={label} labelPlacement="bottom" />
    </div>
  )
}
