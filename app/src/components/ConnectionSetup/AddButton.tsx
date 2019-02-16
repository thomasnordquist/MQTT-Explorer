import * as React from 'react'
import Add from '@material-ui/icons/Add'
import { Fab } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

const styles = (theme: Theme) => ({
  addButton: {
    height: `${theme.spacing.unit * 4}px`,
    width: `${theme.spacing.unit * 4}px`,
    minHeight: '0',
  },
  addIcon: {
    height: `${theme.spacing.unit * 2}px`,
  },
})

export const AddButton = withStyles(styles)((props: {
  classes: any,
  action: any,
}) => {
  return (
    <Fab
      size="small"
      color="secondary"
      aria-label="Add"
      className={props.classes.addButton}
      onClick={props.action}
    >
      <Add className={props.classes.addIcon} />
    </Fab>
  )
})
