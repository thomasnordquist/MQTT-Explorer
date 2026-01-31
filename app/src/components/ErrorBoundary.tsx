import * as React from 'react'
import SentimentDissatisfied from '@mui/icons-material/SentimentDissatisfied'
import Warning from '@mui/icons-material/Warning'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { Button, Modal, Paper, Toolbar, Typography } from '@mui/material'
import PersistentStorage from '../utils/PersistentStorage'

interface State {
  error?: Error
}

interface Props {
  classes: any
  children?: React.ReactNode
}

class ErrorBoundary extends React.PureComponent<Props, State> {
  public static getDerivedStateFromError(error: Error) {
    return { error }
  }

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  private restart = () => {
    window.location.reload()
  }

  private clearStorage = () => {
    PersistentStorage.clear()
    window.location.reload()
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    // electronRendererTelemetry.trackError(error)
    console.log('did catch', error)
  }

  public render() {
    if (!this.state.error) {
      return this.props.children
    }

    const { classes } = this.props
    return (
      <Modal open disableAutoFocus>
        <Paper className={classes.root}>
          <Toolbar style={{ padding: '0' }}>
            <Typography className={classes.title} variant="h6" color="inherit">
              <Warning /> Oooooops!
            </Typography>
          </Toolbar>
          <Typography className={classes.centered}>
            I hoped that you would never see this window, but MQTT-Explorer had an unexpected error.
          </Typography>
          <Typography className={classes.centered}>
            <SentimentDissatisfied />
          </Typography>
          <pre className={classes.textColor} style={{ maxHeight: '35vh', overflow: 'scroll' }}>
            <code className={classes.textColor}>{this.state.error.stack}</code>
          </pre>
          <Typography>
            Please report this issue with a short description of what happened to
            <span>
              {' '}
              <a className={classes.textColor} href="https://github.com/thomasnordquist/MQTT-Explorer/issues">
                https://github.com/thomasnordquist/MQTT-Explorer/issues
              </a>
            </span>
          </Typography>
          <div>
            <div className={classes.buttonPositioning}>
              <Button className={classes.button} variant="contained" color="secondary" onClick={this.clearStorage}>
                Start Fresh
              </Button>
              <Button className={classes.button} variant="contained" color="primary" onClick={this.restart}>
                Restart
              </Button>
            </div>
          </div>
        </Paper>
      </Modal>
    )
  }
}

const styles = (theme: Theme) => ({
  button: {
    margin: '0 8px 0 8px',
  },
  root: {
    minWidth: 550,
    maxWidth: 650,
    backgroundColor: theme.palette.background.default,
    margin: '10vh auto auto auto',
    padding: theme.spacing(2),
    outline: 'none',
  },
  title: {
    color: theme.palette.text.primary,
    margin: '0',
    textAlign: 'center' as const,
  },
  textColor: {
    color: theme.palette.text.primary,
    userSelect: 'all' as const,
  },
  centered: {
    textAlign: 'center' as const,
  },
  buttonPositioning: {
    textAlign: 'center' as const,
    marginTop: theme.spacing(2),
  },
})

export default withStyles(styles)(ErrorBoundary)
