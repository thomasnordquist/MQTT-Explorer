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
import { connect } from 'react-redux'
import { MqttOptions } from '../../../../backend/src/DataSource'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'

import Notification from './Notification'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

const sha1 = require('sha1')
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connectionActions } from '../../actions'

interface Props {
  classes: {[s: string]: string}
  actions: typeof connectionActions,
  visible: boolean
  connected: boolean
  connecting: boolean
  error?: string
}

const protocols = [
  'mqtt://',
  'ws://',
]

interface State {
  showPassword: boolean
  connectionSettings: ConnectionSettings
}

interface ConnectionSettings {
  host: string
  protocol: string
  port: number
  tls: boolean
  certValidation: boolean
  clientId: string
  connectionId?: string
  username: string
  password: string
}

declare var window: any

class Connection extends React.Component<Props, State> {
  private randomClientId: string
  private defaultConnectionSettings: ConnectionSettings = {
    host: 'iot.eclipse.org',
    protocol: protocols[0],
    port: 1883,
    tls: false,
    certValidation: true,
    clientId: '',
    username: '',
    password: '',
    connectionId: undefined,
  }

  constructor(props: any) {
    super(props)

    const clientIdSha = sha1(`${Math.random()}`).slice(0, 8)
    this.randomClientId = `mqtt-explorer-${clientIdSha}`
    this.state = {
      connectionSettings: this.loadConnectionSettings(),
      showPassword: false,
    }
  }

  private loadConnectionSettings(): ConnectionSettings {
    let storedSettings: ConnectionSettings | undefined

    const storedSettingsString = window.localStorage.getItem('connectionSettings')
    try {
      storedSettings = storedSettingsString ? JSON.parse(storedSettingsString) : undefined
    } catch {
      window.localStorage.setItem('connectionSettings', undefined)
    }

    return storedSettings || this.defaultConnectionSettings
  }

  private saveConnectionSettings() {
    window.localStorage.setItem('connectionSettings', JSON.stringify(this.state.connectionSettings))
  }

  private handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  private optionsFromState(): MqttOptions {
    const protocol = this.state.connectionSettings.protocol === 'tcp://' ? 'mqtt://' : this.state.connectionSettings.protocol
    const url = `${protocol}${this.state.connectionSettings.host}:${this.state.connectionSettings.port}`

    return {
      url,
      username: this.state.connectionSettings.username || undefined,
      password: this.state.connectionSettings.password || undefined,
      clientId: this.state.connectionSettings.clientId || this.randomClientId,
      tls: this.state.connectionSettings.tls,
      certValidation: this.state.connectionSettings.certValidation,
    }
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
      inputFormControl: {
        marginTop: '16px',
      },
    }
  }

  private handleChange = (name: string) => (event: any) => {
    this.setState({
      connectionSettings: {
        ...this.state.connectionSettings,
        [name]: event.target.value,
      },
    })
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
    if (this.props.error) {
      renderError = (
        <Notification
          message={this.props.error}
          onClose={() => { this.props.actions.showError(undefined) }}
        />
      )
    }

    return (
      <div>
        {renderError}
        <Modal open={this.props.visible} disableAutoFocus={true}>
            <Paper className={classes.root}>
              <Toolbar>
                <Typography className={classes.title} variant="h6" color="inherit">MQTT Connection</Typography>
              </Toolbar>
              <form className={classes.container} noValidate={true} autoComplete="off">
                <Grid container={true} spacing={24}>
                  <Grid item={true} xs={2}>
                    {this.renderProtocols()}
                  </Grid>
                  <Grid item={true} xs={7}>
                    <TextField
                      label="Host"
                      className={classes.textField}
                      value={this.state.connectionSettings.host}
                      onChange={this.handleChange('host')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item={true} xs={3}>
                    <TextField
                      label="Port"
                      className={classes.textField}
                      value={this.state.connectionSettings.port}
                      onChange={this.handleChange('port')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item={true} xs={5}>
                    <TextField
                      label="Username"
                      className={classes.textField}
                      value={this.state.connectionSettings.username}
                      onChange={this.handleChange('username')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item={true} xs={5}>
                    <FormControl className={`${classes.textField} ${classes.inputFormControl}`}>
                      <InputLabel htmlFor="adornment-password">Password</InputLabel>
                      <Input
                        id="adornment-password"
                        type={this.state.showPassword ? 'text' : 'password'}
                        value={this.state.connectionSettings.password}
                        onChange={this.handleChange('password')}
                        endAdornment={passwordVisibilityButton}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item={true} xs={5}>
                    <FormControl className={`${classes.textField} ${classes.inputFormControl}`}>
                      <InputLabel htmlFor="client-id">Client ID</InputLabel>
                      <Input
                        placeholder={this.randomClientId}
                        className={classes.textField}
                        value={this.state.connectionSettings.clientId || ''}
                        onChange={this.handleChange('clientId')}
                        startAdornment={<span />}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item={true} xs={4}>
                    {this.renderCertValidationSwitch()}
                  </Grid>
                  <Grid item={true} xs={3}>
                    {this.renderTlsSwitch()}
                  </Grid>
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

  private renderProtocols() {
    const { classes } = this.props
    const protocolItems = protocols.map((value: string) => (
      <MenuItem key={value} value={value}>
        {value}
      </MenuItem>
    ))

    return (
      <TextField
        select={true}
        label="Protocol"
        className={classes.textField}
        value={this.state.connectionSettings.protocol}
        onChange={this.handleChange('protocol')}
        margin="normal"
      >
        {protocolItems}
      </TextField>
    )
  }

  private renderCertValidationSwitch() {
    const { classes } = this.props
    const certSwitch = (
      <Switch
        checked={this.state.connectionSettings.certValidation}
        onChange={this.toggleCertValidation}
        color="primary"
      />
    )

    return (
      <div className={classes.switch}>
        <FormControlLabel
          control={certSwitch}
          label="Validate certificate"
          labelPlacement="bottom"
        />
      </div>
    )
  }

  private toggleCertValidation = () => this.setState({
    connectionSettings: {
      ...this.state.connectionSettings,
      certValidation: !this.state.connectionSettings.certValidation,
    },
  })

  private renderTlsSwitch() {
    const { classes } = this.props
    const tlsSwitch = (
      <Switch
        checked={this.state.connectionSettings.tls}
        onChange={this.toggleTls}
        color="primary"
      />
    )

    return (
      <div className={classes.switch}>
        <FormControlLabel
          control={tlsSwitch}
          label="Encryption (tls)"
          labelPlacement="bottom"
        />
      </div>
    )
  }

  private toggleTls = () => this.setState({
    connectionSettings: {
      ...this.state.connectionSettings,
      tls: !this.state.connectionSettings.tls,
    },
  })

  private renderConnectButton() {
    const { classes, actions } = this.props

    if (this.props.connecting) {
      return (
        <Button variant="contained" color="primary" className={classes.button} onClick={actions.disconnect}>
          <CircularProgress size={22} style={{ marginRight: '10px' }} color="secondary" /> Abort
        </Button>
      )
    }
    return (
       <Button variant="contained" color="primary" className={classes.button} onClick={this.onClickConnect}>
        Connect
      </Button>
    )
  }

  private onClickConnect = () => {
    const connectionId = String(sha1(String(Math.random())).slice(0, 8))
    const options = this.optionsFromState()
    this.props.actions.connect(options, connectionId)
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    visible: !state.connection.connected,
    connected: state.connection.connected,
    connecting: state.connection.connecting,
    error: state.connection.error,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(connectionActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(Connection.styles)(Connection))
