import * as React from 'react'
import Delete from '@material-ui/icons/Delete'
import Settings from '@material-ui/icons/Settings'
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew'
import Save from '@material-ui/icons/Save'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionActions, connectionManagerActions } from '../../actions'
import { ConnectionOptions, toMqttConnection } from '../../model/ConnectionOptions'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'

import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Switch,
  TextField,
} from '@material-ui/core'
import ConnectionHealthIndicator from '../helper/ConnectionHealthIndicator'

interface Props {
  connection: ConnectionOptions
  classes: {[s: string]: string}
  actions: typeof connectionActions,
  managerActions: typeof connectionManagerActions
  connected: boolean
  connecting: boolean
}

const protocols = [
  'mqtt',
  'ws',
]

interface State {
  showPassword: boolean
}

class ConnectionSettings extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      showPassword: false,
    }
  }

  private handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  private requiresBasePath() {
    return this.props.connection.protocol !== 'mqtt'
  }

  private renderBasePathInput() {
    return (
      <Grid item={true} xs={4}>
        <TextField
          label="Basepath"
          className={this.props.classes.textField}
          value={this.props.connection.basePath}
          onChange={this.handleChange('basePath')}
          margin="normal"
        />
      </Grid>
    )
  }

  private handleChange = (name: string) => (event: any) => {
    if (!this.props.connection) {
      return
    }

    this.updateConnection(name, event.target.value)
  }

  private updateConnection(name: string, value: any) {
    this.props.managerActions.updateConnection(this.props.connection.id, {
      [name]: value,
    })
  }

  private renderProtocols() {
    const { classes, connection } = this.props

    const protocolItems = protocols.map((value: string) => (
      <MenuItem key={value} value={value}>
        {value}://
      </MenuItem>
    ))

    return (
      <TextField
        select={true}
        label="Protocol"
        className={classes.textField}
        value={connection.protocol}
        onChange={this.updateProtocol}
        margin="normal"
      >
        {protocolItems}
      </TextField>
    )
  }

  private updateProtocol = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.updateConnection('protocol', value)
    if (event.target.value === 'mqtt') {
      this.updateConnection('basePath', undefined)
    } else {
      this.updateConnection('basePath', 'ws')
    }
  }

  private renderCertValidationSwitch() {
    const { classes, connection } = this.props

    const certSwitch = (
      <Switch
        checked={connection.certValidation}
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

  private toggleCertValidation = () => {
    this.props.managerActions.updateConnection(this.props.connection.id, {
      certValidation: !this.props.connection.certValidation,
    })
  }

  private renderTlsSwitch() {
    const { classes, connection } = this.props

    const tlsSwitch = (
      <Switch
        checked={connection.encryption}
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

  private toggleTls = () => {
    this.props.managerActions.updateConnection(this.props.connection.id, {
      encryption: !this.props.connection.encryption,
    })
  }

  private renderConnectButton() {
    const { classes, actions } = this.props

    if (this.props.connecting) {
      return (
        <Button variant="contained" color="primary" className={classes.button} onClick={actions.disconnect}>
          <ConnectionHealthIndicator />&nbsp;&nbsp;Abort
        </Button>
      )
    }
    return (
       <Button variant="contained" color="primary" className={classes.button} onClick={this.onClickConnect}>
        <PowerSettingsNew /> Connect
      </Button>
    )
  }

  private onClickConnect = () => {
    if (!this.props.connection) {
      return
    }

    const mqttOptions = toMqttConnection(this.props.connection)
    if (mqttOptions) {
      this.props.actions.connect(mqttOptions, this.props.connection.id)
    }
  }

  public render() {
    const { classes, connection } = this.props

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

    return (
      <div>
        <form className={classes.container} noValidate={true} autoComplete="off">
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={5}>
              <TextField
                label="Name"
                className={classes.textField}
                value={connection.name}
                onChange={this.handleChange('name')}
                margin="normal"
              />
            </Grid>
            <Grid item={true} xs={4}>
              {this.renderCertValidationSwitch()}
            </Grid>
            <Grid item={true} xs={3}>
              {this.renderTlsSwitch()}
            </Grid>
            <Grid item={true} xs={2}>
              {this.renderProtocols()}
            </Grid>
            <Grid item={true} xs={7}>
              <TextField
                label="Host"
                className={classes.textField}
                value={connection.host}
                onChange={this.handleChange('host')}
                margin="normal"
              />
            </Grid>
            <Grid item={true} xs={3}>
              <TextField
                label="Port"
                className={classes.textField}
                value={connection.port}
                onChange={this.handleChange('port')}
                margin="normal"
              />
            </Grid>
            {this.requiresBasePath() ? this.renderBasePathInput() : null}
            <Grid item={true} xs={this.requiresBasePath() ? 4 : 6}>
              <TextField
                label="Username"
                className={classes.textField}
                value={connection.username}
                onChange={this.handleChange('username')}
                margin="normal"
              />
            </Grid>
            <Grid item={true} xs={this.requiresBasePath() ? 4 : 6}>
              <FormControl className={`${classes.textField} ${classes.inputFormControl}`}>
                <InputLabel htmlFor="adornment-password">Password</InputLabel>
                <Input
                  id="adornment-password"
                  type={this.state.showPassword ? 'text' : 'password'}
                  value={connection.password}
                  onChange={this.handleChange('password')}
                  endAdornment={passwordVisibilityButton}
                />
              </FormControl>
            </Grid>
          </Grid>
          <br />
          <div>
            <div style={{ float: 'left' }}>
              <Button variant="contained" className={classes.button} onClick={() => this.props.managerActions.deleteConnection(this.props.connection.id)}>
                Delete <Delete />
              </Button>
              <Button variant="contained" className={classes.button} onClick={this.props.managerActions.toggleAdvancedSettings}>
                <Settings /> Advanced
              </Button>
            </div>
            <div style={{ float : 'right' }}>
              <Button variant="contained" color="secondary" className={classes.button} onClick={this.props.managerActions.saveConnectionSettings}>
                <Save /> Save
              </Button>
              {this.renderConnectButton()}
            </div>
          </div>
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    connected: state.connection.connected,
    connecting: state.connection.connecting,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(connectionActions, dispatch),
    managerActions: bindActionCreators(connectionManagerActions, dispatch),
  }
}

const styles: StyleRulesCallback<string> = (theme: Theme) => {
  return {
    textField: {
      width: '100%',
    },
    switch: {
      marginTop: 0,
    },
    button: {
      margin: theme.spacing(1),
    },
    inputFormControl: {
      marginTop: '16px',
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ConnectionSettings))
