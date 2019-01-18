import * as React from 'react'
import * as q from '../../backend/src/Model'
import {
  Button,
  Modal,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core'

import Warning from '@material-ui/icons/Warning'
import SentimentDissatisfied from '@material-ui/icons/SentimentDissatisfied'

import { Theme, withStyles } from '@material-ui/core/styles'

interface State {
  error?: Error
}

interface Props {
  classes: any
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.log('did catch', error)
  }

  public static getDerivedStateFromError(error: Error) {
    return { error }
  }

  private restart = () => {
    window.location = window.location
  }

  private clearStorage = () => {
    localStorage.clear()
    window.location = window.location
  }

  public render() {
    if (!this.state.error) {
      return this.props.children
    }

    const { classes } = this.props
    return (
      <Modal open={true} disableAutoFocus={true}>
        <Paper className={classes.root}>
          <Toolbar style={{ padding: '0' }}>
            <Typography className={classes.title} variant="h6" color="inherit"><Warning /> Oooooops!</Typography>
          </Toolbar>
          <Typography>I hoped that you would never see this window, but MQTT-Explorer had an unexpected error.</Typography>
          <Typography style={{ textAlign: 'center' }}><SentimentDissatisfied /></Typography>
          <pre className={classes.textColor} style={{ maxHeight: '40vh', overflow: 'scroll' }}>
            <code className={classes.textColor}>
              {this.state.error.stack}
            </code>
          </pre>
          <Typography>
            Please report this issue with a short description of what happened to
            <span> <a className={classes.textColor} href="https://github.com/thomasnordquist/MQTT-Explorer/issues">https://github.com/thomasnordquist/MQTT-Explorer/issues</a></span>
          </Typography>
          <div>
            <div className={classes.buttonPositioning}><Button onClick={this.restart}>Restart</Button></div>
            <div className={classes.buttonPositioning}><Button onClick={this.clearStorage}>Start Fresh</Button></div>
          </div>
        </Paper>
      </Modal>
    )
  }
}

const styles = (theme: Theme) => ({
  root: {
    minWidth: 550,
    maxWidth: 650,
    backgroundColor: theme.palette.background.default,
    margin: '14vh auto auto auto',
    padding: `${2 * theme.spacing.unit}px`,
    outline: 'none',
  },
  title: {
    color: theme.palette.text.primary,
    margin: '0',
    textAlign: 'center' as 'center',
  },
  textColor: {
    color: theme.palette.text.primary,
  },
  buttonPositioning: {
    textAlign: 'center' as 'center',
    marginTop: `${theme.spacing.unit * 2}px`,
  },
})

export default withStyles(styles)(ErrorBoundary)
