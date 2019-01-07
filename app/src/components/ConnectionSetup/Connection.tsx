import * as React from 'react'
import { Typography, Toolbar, Modal, MenuItem, Button, Grid, Paper, TextField, Switch, FormControlLabel } from '@material-ui/core'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import Notification from './Notification'
import { MqttOptions, DataSourceState } from '../../../../backend/src/DataSource'
import { addMqttConnectionEvent, makeConnectionStateEvent, rendererEvents } from '../../../../events'
import sha1 = require('sha1')

interface Props {
  classes: {[s: string]: string}
  theme: Theme
  onAbort: () => void,
  onConnection: (connectionId: string) => void
}

const protocols = [
  'tcp://',
  'ws://',
]

interface State {
  error?: Error
  visible: boolean
  host: string
  protocol: string
  port: number
  ssl: boolean
  sslValidation: boolean
  clientId: string
  username: string
  password: string
}

declare var window: any

class Connection extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    const storedSettingsString = window.localStorage.getItem('connectionSettings')
    let storedSettings
    try {
      storedSettings = storedSettingsString ? JSON.parse(storedSettingsString) : undefined
    } catch {
      window.localStorage.setItem('connectionSettings', undefined)
    }

    const defaultState = {
      visible: true,
      host: 'nodered',
      protocol: protocols[0],
      port: 1883,
      ssl: false,
      sslValidation: true,
      clientId: '',
      username: '',
      password: '',
    }

    this.state = Object.assign({}, defaultState, storedSettings)
  }

  private saveConnectionSettings() {
    window.localStorage.setItem('connectionSettings', JSON.stringify(this.state))
  }

  private optionsFromState(): MqttOptions {
    const protocol = this.state.protocol === 'tcp://' ? 'mqtt://' : this.state.protocol
    const url = `${protocol}${this.state.host}:${this.state.port}`

    return {
      url,
      username: this.state.username || undefined,
      password: this.state.username || undefined,
      ssl: this.state.ssl,
      sslValidation: this.state.sslValidation,
    }
  }

  private connect() {
    const options = this.optionsFromState()
    const connectionId = (sha1(Math.random() + JSON.stringify(options)).slice(0, 8)) as string
    rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })
    rendererEvents.subscribe(makeConnectionStateEvent(connectionId), (state: DataSourceState) => {
      if (state.connected) {
        this.props.onConnection(connectionId)
        this.setState({ visible: false })
      } else if (state.error) {
        console.log('error', state.error)
        this.setState({ error: state.error })
      }
    })
  }

  public static styles: StyleRulesCallback<string> = (theme: Theme) => {
    return {
      root: {
        minWidth: 550,
        maxWidth: 650,
        backgroundColor: theme.palette.background.default,
        margin: '20vh auto auto auto',
        padding: `${2 * theme.spacing.unit}px`,
        outline: 'none',
      },
      title: {
        color: theme.palette.text.primary,
      },
      paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
      textField: {
        width: '100%',
      },
      switch: {
        marginTop: `${1 * theme.spacing.unit}px`,
      },
      button: {
        margin: theme.spacing.unit,
      },
    }
  }

  private handleChange = (name: string) => (event: any) => {
    const state: any = {
      [name]: event.target.value,
    }
    this.setState(state)
  }

  public render() {
    const { classes } = this.props
    return <Modal open={this.state.visible} disableAutoFocus={true} onClose={() => { console.log('close') }}>
        <Paper className={classes.root}>
          <Toolbar>
            <Typography className={classes.title} variant="h6" color="inherit">MQTT Connection</Typography>
          </Toolbar>
          <form className={classes.container} noValidate autoComplete="off">
            <Grid container spacing={24}>
              <Grid item xs={2}>
                <TextField
                  select
                  label="Protocol"
                  className={classes.textField}
                  value={this.state.protocol}
                  onChange={this.handleChange('protocol')}
                  margin="normal"
                >
                  {protocols.map((value: string) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={7}>
                <TextField
                  label="Host"
                  className={classes.textField}
                  value={this.state.host}
                  onChange={this.handleChange('host')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Port"
                  className={classes.textField}
                  value={this.state.port}
                  onChange={this.handleChange('port')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Username"
                  className={classes.textField}
                  value={this.state.username}
                  onChange={this.handleChange('username')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Password"
                  type="type"
                  className={classes.textField}
                  value={this.state.password}
                  onChange={this.handleChange('password')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={3}>
                <div className={classes.switch}>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={this.state.sslValidation}
                        onChange={() => this.setState({ sslValidation: !this.state.sslValidation })}
                        color="primary"
                      />
                    )}
                    label="Validate certificate"
                    labelPlacement="bottom"
                  />
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className={classes.switch}>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={this.state.ssl}
                        onChange={() => this.setState({ ssl: !this.state.ssl })}
                        color="primary"
                      />
                    )}
                    label="Encryption"
                    labelPlacement="bottom"
                  />
                </div>
              </Grid>
              <Grid item xs={6}></Grid>
            </Grid>
            <br />
            <div style={{ textAlign: 'right' }}>
              <Button variant="contained" color="secondary" className={classes.button} onClick={() => this.saveConnectionSettings()}>
                Save
              </Button>
              <Button variant="contained" color="primary" className={classes.button} onClick={() => this.connect()}>
                Connect
              </Button>
            </div>
          </form>
        </Paper>
    </Modal>
  }
}

export default withStyles(Connection.styles, { withTheme: true })(Connection)
