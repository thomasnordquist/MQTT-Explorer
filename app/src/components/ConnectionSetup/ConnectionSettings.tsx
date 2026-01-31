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
import { Button, Grid, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from '@mui/material'
import { AppState } from '../../reducers'
import { connectionActions, connectionManagerActions, globalActions } from '../../actions'
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
  globalActions: typeof globalActions
  connected: boolean
  connecting: boolean
}

const protocols = ['mqtt', 'ws']

function ConnectionSettings(props: Props) {
  const [showPassword, setShowPassword] = useState(false)

  const handleDelete = useCallback(async () => {
    const confirmed = await props.globalActions.requestConfirmation(
      'Delete Connection',
      `Are you sure you want to delete the connection "${props.connection.name}"?\n\nThis action cannot be undone.`
    )

    if (confirmed) {
      props.managerActions.deleteConnection(props.connection.id)
    }
  }, [props.connection.id, props.connection.name, props.globalActions, props.managerActions])

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
          margin="dense"
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
        {value === 'mqtt' ? '(Standard)' : '(WebSocket)'}
      </MenuItem>
    ))

    return (
      <Tooltip title="Use 'mqtt' for standard connections or 'ws' for WebSocket connections" arrow>
        <TextField
          select
          label="Protocol"
          className={classes.textField}
          value={connection.protocol}
          onChange={updateProtocol}
          margin="dense"
          inputProps={{
            'aria-label': 'MQTT protocol',
          }}
        >
          {protocolItems}
        </TextField>
      </Tooltip>
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
        <Tooltip title={props.showPassword ? 'Hide password' : 'Show password'} arrow>
          <IconButton
            aria-label={props.showPassword ? 'Hide password' : 'Show password'}
            onClick={props.toggle}
            edge="end"
          >
            {props.showPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Tooltip>
      </InputAdornment>
    )
  }

  const { classes, connection } = props

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <form className={classes.container} noValidate autoComplete="off" style={{ flex: 1, overflow: 'auto' }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <TextField
              autoFocus
              label="Name"
              className={classes.textField}
              value={connection.name}
              onChange={handleChange('name')}
              margin="dense"
              placeholder="My MQTT Connection"
              inputProps={{
                'aria-label': 'Connection name',
              }}
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
              margin="dense"
              placeholder="broker.example.com"
              inputProps={{
                'data-testid': 'host-input',
                'aria-label': 'MQTT broker host',
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Port"
              className={classes.textField}
              value={connection.port}
              onChange={handleChange('port')}
              margin="dense"
              type="number"
              placeholder="1883"
              inputProps={{
                'aria-label': 'MQTT broker port',
                min: 1,
                max: 65535,
              }}
            />
          </Grid>
          {requiresBasePath() ? renderBasePathInput() : null}
          <Grid item xs={requiresBasePath() ? 4 : 6}>
            <TextField
              label="Username"
              className={classes.textField}
              value={connection.username}
              onChange={handleChange('username')}
              margin="dense"
              placeholder="Optional"
              inputProps={{
                'aria-label': 'MQTT username',
                autoComplete: 'username',
              }}
            />
          </Grid>
          <Grid item xs={requiresBasePath() ? 4 : 6}>
            <TextField
              label="Password"
              className={classes.textField}
              type={showPassword ? 'text' : 'password'}
              value={connection.password}
              onChange={handleChange('password')}
              margin="dense"
              placeholder="Optional"
              InputProps={{
                endAdornment: <PasswordVisibilityButton showPassword={showPassword} toggle={handleClickShowPassword} />,
              }}
              inputProps={{
                'aria-label': 'MQTT password',
                autoComplete: 'current-password',
              }}
            />
          </Grid>
        </Grid>
      </form>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <div>
          <Tooltip title="Delete this connection permanently" arrow>
            <Button
              variant="contained"
              color="error"
              className={classes.button}
              onClick={handleDelete}
              aria-label="Delete connection"
            >
              <Delete /> Delete
            </Button>
          </Tooltip>
          <Tooltip title="Advanced connection settings" arrow>
            <Button
              variant="contained"
              className={classes.button}
              onClick={props.managerActions.toggleAdvancedSettings}
              data-testid="advanced-button"
              aria-label="Show advanced settings"
            >
              <Settings /> Advanced
            </Button>
          </Tooltip>
        </div>
        <div>
          <Tooltip title="Save connection settings" arrow>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={props.managerActions.saveConnectionSettings}
              aria-label="Save connection"
            >
              <Save /> Save
            </Button>
          </Tooltip>
          <ConnectButton toggle={toggleConnect} connecting={props.connecting} classes={classes} />
        </div>
      </div>
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
  globalActions: bindActionCreators(globalActions, dispatch),
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
