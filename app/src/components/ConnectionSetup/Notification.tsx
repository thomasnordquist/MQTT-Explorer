import * as React from 'react'
import { Snackbar, SnackbarContent } from '@material-ui/core'
import { red, green } from '@material-ui/core/colors'
import { withStyles, Theme } from '@material-ui/core/styles'

enum MessageType {
  success = 'success',
  error = 'error',
}

interface Props {
  message: string
  type: MessageType
  onClose: () => void
  classes: any
}

interface State {
  snackBarOpen: boolean
}

class Notification extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { snackBarOpen: false }
  }

  public static styles = (theme: Theme) => ({
    success: {
      backgroundColor: green[600],
      color: theme.typography.button.color,
    },
    error: {
      backgroundColor: red[600],
      color: theme.typography.button.color,
    },
  })

  public render() {
    return <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open = {this.state.snackBarOpen}
      autoHideDuration = {6000}
      onClose = {() => { this.setState({ snackBarOpen: false }) }}
    >
      <SnackbarContent
        className = {this.props.classes[this.props.type]}
        message = {this.props.message}
      />
    </Snackbar>
  }
}

export default withStyles(Notification.styles)(Notification)
