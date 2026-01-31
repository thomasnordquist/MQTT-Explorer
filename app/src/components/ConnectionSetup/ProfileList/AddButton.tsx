import * as React from 'react'
import Add from '@mui/icons-material/Add'
import { Fab } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

const styles = (theme: Theme) => ({
  addButton: {
    height: theme.spacing(4),
    width: theme.spacing(4),
    minHeight: '0',
  },
  addIcon: {
    height: theme.spacing(2),
  },
})

export const AddButton = withStyles(styles)((props: { classes: any; action: any }) => (
  <span id="addProfileButton" style={{ marginRight: '12px' }}>
    <Fab size="small" color="secondary" aria-label="Add" className={props.classes.addButton} onClick={props.action}>
      <Add className={props.classes.addIcon} />
    </Fab>
  </span>
))
