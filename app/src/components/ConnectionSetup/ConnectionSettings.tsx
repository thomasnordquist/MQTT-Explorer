import React, { useCallback, useState } from 'react'
import Save from '@mui/icons-material/Save'
import Delete from '@mui/icons-material/Delete'
import Settings from '@mui/icons-material/Settings'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  TextField,
} from '@mui/material'
import { AppState } from '../../reducers'
import { connectionActions, connectionManagerActions } from '../../actions'
import { ConnectionOptions, toMqttConnection } from '../../model/ConnectionOptions'
import { KeyCodes } from '../../utils/KeyCodes'
import { ToggleSwitch } from './ToggleSwitch'
import { useGlobalKeyEventHandler } from '../../effects/useGlobalKeyEventHandler'
import ConnectButton from './ConnectButton'

interface Props {
  connection: ConnectionOptions
  classes: { [s: string]: string }
  actions: typeof connectionActions
  managerActions: typeof connectionManagerActions
  connected: boolean
  connecting: boolean
}

const protocols = ['mqtt', 'ws']

function ConnectionSettings(props: Props) {
  const [showPassword, setShowPassword] = useState(false)

  const toggleConnect = useCallback(() => {
    if (props.connecting) {
      props.actions.disconnect()
      return
    }

    if (!props.connection) {
      return
    }

    const mqttOptions = toMqttConnection(props.connection)
    if (mqttOptions) {
      props.actions.connect(mqttOptions, props.connection.id)
    }
  }, [props.connection, props.connecting])

  useGlobalKeyEventHandler(KeyCodes.escape, props.actions.disconnect)
  useGlobalKeyEventHandler(KeyCodes.enter, toggleConnect, [props.connecting])

  const handleClickShowPassword = useCallback(() => {
    setShowPassword(!showPassword)
  }, [showPassword])

  function requiresBasePath() {
    return props.connection.protocol !== 'mqtt'
  }

  function renderBasePathInput() {
    return (
      <Grid item xs={4}>
        <TextField
          label="Basepath"
          className={props.classes.textField}
          value={props.connection.basePath}
          onChange={handleChange('basePath')}
          margin="normal"
        />
      </Grid>
    )
  }

  const handleChange = (name: string) => (event: any) => {
    if (!props.connection) {
      return
    }

    updateConnection(name, event.target.value)
  }

  const updateConnection = (name: string, value: any) => {
    props.managerActions.updateConnection(props.connection.id, {
      [name]: value,
    })
  }

  const renderProtocols = () => {
    const { classes, connection } = props

    const protocolItems = protocols.map((value: string) => (
      <MenuItem key={value} value={value}>
        {value}
        ://
      </MenuItem>
    ))

    return (
      <TextField
        select
        label="Protocol"
        className={classes.textField}
        value={connection.protocol}
        onChange={updateProtocol}
        margin="normal"
      >
        {protocolItems}
      </TextField>
    )
  }

  const updateProtocol = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    updateConnection('protocol', value)
    if (event.target.value === 'mqtt') {
      updateConnection('basePath', undefined)
    } else {
      updateConnection('basePath', 'ws')
    }
  }

  const toggleCertValidation = () => {
    props.managerActions.updateConnection(props.connection.id, {
      certValidation: !props.connection.certValidation,
    })
  }

  const toggleTls = () => {
    props.managerActions.updateConnection(props.connection.id, {
      encryption: !props.connection.encryption,
    })
  }

  function PasswordVisibilityButton(props: { showPassword: boolean; toggle: () => void }) {
    return (
      <InputAdornment position="end">
        <IconButton aria-label="Toggle password visibility" onClick={props.toggle}>
          {props.showPassword ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    )
  }

  const { classes, connection } = props

  return (
    <div>
      <form className={classes.container} noValidate autoComplete="off">
        <Grid container spacing={3}>
          <Grid item xs={5}>
            <TextField
              autoFocus
              label="Name"
              className={classes.textField}
              value={connection.name}
              onChange={handleChange('name')}
              margin="normal"
            />
          </Grid>
          <Grid item xs={4}>
            <ToggleSwitch
              label="Validate certificate"
              classes={classes}
              value={connection.certValidation}
              toggle={toggleCertValidation}
            />
          </Grid>
          <Grid item xs={3}>
            <ToggleSwitch label="Encryption (tls)" classes={classes} value={connection.encryption} toggle={toggleTls} />
          </Grid>
          <Grid item xs={2}>
            {renderProtocols()}
          </Grid>
          <Grid item xs={7}>
            <TextField
              label="Host"
              className={classes.textField}
              value={connection.host}
              onChange={handleChange('host')}
              margin="normal"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Port"
              className={classes.textField}
              value={connection.port}
              onChange={handleChange('port')}
              margin="normal"
            />
          </Grid>
          {requiresBasePath() ? renderBasePathInput() : null}
          <Grid item xs={requiresBasePath() ? 4 : 6}>
            <TextField
              label="Username"
              className={classes.textField}
              value={connection.username}
              onChange={handleChange('username')}
              margin="normal"
            />
          </Grid>
          <Grid item xs={requiresBasePath() ? 4 : 6}>
            <FormControl className={`${classes.textField} ${classes.inputFormControl}`}>
              <InputLabel htmlFor="adornment-password">Password</InputLabel>
              <Input
                id="adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={connection.password}
                onChange={handleChange('password')}
                endAdornment={<PasswordVisibilityButton showPassword={showPassword} toggle={handleClickShowPassword} />}
              />
            </FormControl>
          </Grid>
        </Grid>
        <br />
        <div>
          <div style={{ float: 'left' }}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={() => props.managerActions.deleteConnection(props.connection.id)}
            >
              Delete
              {' '}
              <Delete />
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              onClick={props.managerActions.toggleAdvancedSettings}
              data-testid="advanced-button"
            >
              <Settings />
              {' '}
              Advanced
            </Button>
          </div>
          <div style={{ float: 'right' }}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={props.managerActions.saveConnectionSettings}
            >
              <Save />
              {' '}
              Save
            </Button>
            <ConnectButton toggle={toggleConnect} connecting={props.connecting} classes={classes} />
          </div>
        </div>
      </form>
    </div>
  )
}

const mapStateToProps = (state: AppState) => ({
  connected: state.connection.connected,
  connecting: state.connection.connecting,
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(connectionActions, dispatch),
  managerActions: bindActionCreators(connectionManagerActions, dispatch),
})

const styles = (theme: Theme) => ({
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
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ConnectionSettings) as any)
