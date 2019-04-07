import * as React from 'react'

import { Snackbar, SnackbarContent } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'
import { green, red } from '@material-ui/core/colors'

interface Props {
  message?: string
  type: 'error' | 'notification'
  onClose: () => void
  classes: any
}

class Notification extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  public static styles = (theme: Theme) => ({
    notification: {
      backgroundColor: green[600],
      color: theme.typography.button.color,
    },
    error: {
      backgroundColor: red[600],
      color: theme.typography.button.color,
    },
  })

  public render() {
    const snackbarAnchor = {
      vertical: 'bottom' as 'bottom',
      horizontal: 'left' as 'left',
    }

    return (
      <Snackbar
        anchorOrigin={snackbarAnchor}
        open={Boolean(this.props.message)}
        autoHideDuration={10000}
        onClose={this.props.onClose}
      >
        <SnackbarContent
          className={this.props.type === 'error' ? this.props.classes.error : this.props.classes.notification}
          message={this.props.message}
        />
      </Snackbar>
    )
  }
}

export default withStyles(Notification.styles)(Notification)
