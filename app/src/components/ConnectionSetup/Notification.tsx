import * as React from 'react'

import { Snackbar, SnackbarContent } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'
import { green, red } from '@material-ui/core/colors'

enum MessageType {
  success = 'success',
  error = 'error',
}

interface Props {
  message?: string
  type: MessageType
  onClose: () => void
  classes: any
}

class Notification extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
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
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={Boolean(this.props.message)}
        autoHideDuration={10000}
        onClose={this.props.onClose}
      >
        <SnackbarContent
          className={this.props.classes[this.props.type]}
          message={this.props.message}
        />
      </Snackbar>
    )
  }
}

export default withStyles(Notification.styles)(Notification)
