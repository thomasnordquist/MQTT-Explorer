import * as React from 'react'

import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core'
import { DataSourceState, MqttOptions } from '../../../../backend/src/DataSource'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'
import { addMqttConnectionEvent, makeConnectionStateEvent, removeConnection, rendererEvents } from '../../../../events'

import Notification from './Notification'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

import sha1 = require('sha1')

interface Props {
  classes: {[s: string]: string}
  theme: Theme
  onAbort: () => void,
  onConnection: (connectionId: string) => void
}

const protocols = [
  'mqtt://',
  'ws://',
]

interface State {
  connecting: boolean
  connectionId?: string
  error?: string
  visible: boolean
  host: string
  protocol: string
  port: number
  tls: boolean
  certValidation: boolean
  clientId: string
  username: string
  password: string
  showPassword: boolean
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
      host: 'iot.eclipse.org',
      protocol: protocols[0],
      port: 1883,
      tls: false,
      certValidation: true,
      clientId: '',
      username: '',
      password: '',
      connecting: false,
      connectionId: undefined,
      showPassword: false,
    }

    this.state = Object.assign({}, defaultState, storedSettings)
  }

  private saveConnectionSettings() {
    window.localStorage.setItem('connectionSettings', JSON.stringify(this.state))
  }

  private handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  private optionsFromState(): MqttOptions {
    const protocol = this.state.protocol === 'tcp://' ? 'mqtt://' : this.state.protocol
    const url = `${protocol}${this.state.host}:${this.state.port}`

    return {
      url,
      username: this.state.username || undefined,
      password: this.state.password || undefined,
      tls: this.state.tls,
      certValidation: this.state.certValidation,
    }
  }

  private connect() {
    this.setState({
      connecting: true,
    })

    const options = this.optionsFromState()
    const connectionId = (sha1(Math.random() + JSON.stringify(options)).slice(0, 8)) as string
    this.setState({ connectionId })
    rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })
    const event = makeConnectionStateEvent(connectionId)

    rendererEvents.subscribe(event, (state: DataSourceState) => {
      console.log(state)
      if (state.connected) {
        this.props.onConnection(connectionId)
        this.setState({ visible: false })
      } else if (state.error) {
        this.setState({ error: state.error })
        this.disconnect()
      }
    })
  }

  private disconnect() {
    this.setState({
      connecting: false,
    })
    rendererEvents.emit(removeConnection, this.state.connectionId)
  }

  public static styles: StyleRulesCallback<string> = (theme: Theme) => {
    return {
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
      passwordFormControl: {
        marginTop: '16px',
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

    const passwordVisibilityButton = (
      <InputAdornment position="end">
        <IconButton
          aria-label="Toggle password visibility"
          onClick={this.handleClickShowPassword}
        >
          {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    )

    let renderError = null
    if (this.state.error) {
      renderError = (
        <Notification
          message={this.state.error}
          type="error"
          onClose={() => { this.setState({ error: undefined }) }}
        />
      )
    }

    return (
      <div>
        {renderError}
        <Modal open={this.state.visible} disableAutoFocus={true}>
            <Paper className={classes.root}>
              <Toolbar>
                <Typography className={classes.title} variant="h6" color="inherit">MQTT Connection</Typography>
              </Toolbar>
              <form className={classes.container} noValidate={true} autoComplete="off">
                <Grid container={true} spacing={24}>
                  <Grid item={true} xs={2}>
                    <TextField
                      select={true}
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
                  <Grid item={true} xs={3}>
                    <TextField
                      label="Port"
                      className={classes.textField}
                      value={this.state.port}
                      onChange={this.handleChange('port')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item={true} xs={5}>
                    <TextField
                      label="Username"
                      className={classes.textField}
                      value={this.state.username}
                      onChange={this.handleChange('username')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item={true} xs={5}>
                    <FormControl className={`${classes.textField} ${classes.passwordFormControl}`}>
                      <InputLabel htmlFor="adornment-password">Password</InputLabel>
                      <Input
                        id="adornment-password"
                        type={this.state.showPassword ? 'text' : 'password'}
                        value={this.state.password}
                        onChange={this.handleChange('password')}
                        endAdornment={passwordVisibilityButton}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item={true} xs={4}>
                    <div className={classes.switch}>
                      <FormControlLabel
                        control={(
                          <Switch
                            checked={this.state.certValidation}
                            onChange={() => this.setState({ certValidation: !this.state.certValidation })}
                            color="primary"
                          />
                        )}
                        label="Validate certificate"
                        labelPlacement="bottom"
                      />
                    </div>
                  </Grid>
                  <Grid item={true} xs={4}>
                    <div className={classes.switch}>
                      <FormControlLabel
                        control={(
                          <Switch
                            checked={this.state.tls}
                            onChange={() => this.setState({ tls: !this.state.tls })}
                            color="primary"
                          />
                        )}
                        label="Encryption (tls)"
                        labelPlacement="bottom"
                      />
                    </div>
                  </Grid>
                  <Grid item={true} xs={4} />
                </Grid>
                <br />
                <div style={{ textAlign: 'right' }}>
                  <Button variant="contained" color="secondary" className={classes.button} onClick={() => this.saveConnectionSettings()}>
                    Save
                  </Button>
                  {this.renderConnectButton()}
                </div>
              </form>
            </Paper>
        </Modal>
      </div>
    )
  }

  private renderConnectButton() {
    const { classes } = this.props

    if (this.state.connecting) {
      return <Button variant="contained" color="primary" className={classes.button} onClick={this.onClickAbort}>
        <CircularProgress size={22} style={{ marginRight: '10px' }} color="secondary" /> Abort
      </Button>
    }
    return <Button variant="contained" color="primary" className={classes.button} onClick={this.onClickConnect}>
      Connect
    </Button>
  }

  private onClickConnect = () => {
    this.connect()
  }

  private onClickAbort = () => {
    this.disconnect()
  }
}

export default withStyles(Connection.styles, { withTheme: true })(Connection)
