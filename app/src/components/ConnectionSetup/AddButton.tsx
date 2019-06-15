import * as React from 'react'
import Add from '@material-ui/icons/Add'
import { Fab } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

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

export const AddButton = withStyles(styles)((props: { classes: any; action: any }) => {
  return (
    <Fab size="small" color="secondary" aria-label="Add" className={props.classes.addButton} onClick={props.action}>
      <Add className={props.classes.addIcon} />
    </Fab>
  )
})
