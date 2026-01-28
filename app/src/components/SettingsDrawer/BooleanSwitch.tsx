import * as React from 'react'
import { InputLabel, Switch, Theme, Tooltip } from '@mui/material'
import { withStyles } from '@mui/styles'

const sha1 = require('sha1')

function BooleanSwitch(props: {
  title: string
  value: boolean
  tooltip: string
  action: () => void
  classes: any
  'data-testid'?: string
}) {
  const { tooltip, value, action, title, classes } = props

  const clickHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    action()
  }

  return (
    <div style={{ padding: '8px', display: 'flex' }}>
      <Tooltip title={tooltip}>
        <InputLabel htmlFor={`toggle-${sha1(title)}`} onClick={clickHandler} className={classes.label}>
          {title}
        </InputLabel>
      </Tooltip>
      <Tooltip title={tooltip}>
        <Switch
          name={`toggle-${sha1(title)}`}
          checked={value}
          onChange={action}
          color="primary"
          data-testid={props['data-testid']}
        />
      </Tooltip>
    </div>
  )
}

const styles = (theme: Theme) => ({
  label: {
    flex: '1',
    paddingTop: theme.spacing(1.5),
  },
})

export default withStyles(styles)(BooleanSwitch)
