import * as React from 'react'

import { connect } from 'react-redux'
import { Snackbar, SnackbarContent, Modal, Paper } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'
import Connection from './Connection'
import { AppState } from '../../reducers'
import ProfileList from './ProfileList'

interface Props {
  classes: any
  visible: boolean
}

class ConnectionManager extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  public render() {
    const { classes } = this.props
    return (
      <div>
        <Modal open={this.props.visible} disableAutoFocus={true}>
          <Paper className={classes.root}>
            <div className={this.props.classes.left}><ProfileList /></div>
            <div className={this.props.classes.right}><Connection /></div>
          </Paper>
        </Modal>
      </div>
    )
  }
}

const styles = (theme: Theme) => ({
  root: {
    margin: '13vw 10vw 0 10vw',
    minWidth: '550px',
    outline: 'none' as 'none',
    display: 'flex' as 'flex',
  },
  left: {
    borderRightStyle: 'dotted' as 'dotted',
    borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
    padding: `${2 * theme.spacing.unit}px 0`,
    flex: 3,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  right: {
    borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    backgroundColor: theme.palette.background.paper,
    padding: `${2 * theme.spacing.unit}px`,
    flex: 10,
  },
})

const mapStateToProps = (state: AppState) => {
  return {
    visible: !state.connection.connected,
  }
}

export default connect(mapStateToProps)(withStyles(styles)(ConnectionManager))
