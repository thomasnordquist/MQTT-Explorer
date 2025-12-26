import * as React from 'react'
import Add from '@mui/icons-material/Add'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions, globalActions } from '../../actions'
import { IconButton, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

const styles = (theme: Theme) => ({
  container: {
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: theme.spacing(1),
    // Only show on mobile
    [theme.breakpoints.up('md')]: {
      display: 'none' as 'none',
    },
  },
  selectorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  select: {
    flex: 1,
  },
  label: {
    marginBottom: theme.spacing(0.5),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  addButton: {
    padding: theme.spacing(1),
  },
})

interface Props {
  classes: any
  connections: Array<{ id: string; name?: string; host?: string }>
  currentConnectionId?: string
  actions: {
    connectionManager: typeof connectionManagerActions
    global: typeof globalActions
  }
}

class MobileConnectionSelector extends React.PureComponent<Props, {}> {
  private handleConnectionChange = (event: SelectChangeEvent<string>) => {
    const connectionId = event.target.value
    this.props.actions.connectionManager.selectConnection(connectionId)
  }

  private handleCreateConnection = () => {
    this.props.actions.connectionManager.createConnection()
    // Settings drawer is already open, no need to toggle it
  }

  private getConnectionDisplayName = (connection: { name?: string; host?: string }) => {
    return connection.name || connection.host || 'Unnamed Connection'
  }

  public render() {
    const { classes, connections, currentConnectionId } = this.props

    if (!connections || connections.length === 0) {
      return null
    }

    return (
      <div className={classes.container}>
        <InputLabel className={classes.label} htmlFor="mobile-connection-selector">
          MQTT Connection
        </InputLabel>
        <div className={classes.selectorRow}>
          <Select
            id="mobile-connection-selector"
            className={classes.select}
            value={currentConnectionId || ''}
            onChange={this.handleConnectionChange}
            aria-label="Select MQTT connection"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: '60vh',
                },
              },
            }}
          >
            {connections.map(conn => {
              const isConnected = conn.id === currentConnectionId
              const displayName = this.getConnectionDisplayName(conn)
              return (
                <MenuItem key={conn.id} value={conn.id}>
                  {displayName}
                  {isConnected && ' (Connected)'}
                </MenuItem>
              )
            })}
          </Select>
          <IconButton
            className={classes.addButton}
            onClick={this.handleCreateConnection}
            aria-label="Create new connection"
            size="small"
          >
            <Add />
          </IconButton>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  const connectionManager = state.connectionManager
  const connections = connectionManager
    ? connectionManager
        .get('connections')
        ?.valueSeq()
        .map((conn: any) => ({
          id: conn.get('id'),
          name: conn.get('name'),
          host: conn.get('host'),
        }))
        .toArray()
    : []

  return {
    connections,
    currentConnectionId: state.connection.connectionId,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      connectionManager: bindActionCreators(connectionManagerActions, dispatch),
      global: bindActionCreators(globalActions, dispatch),
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MobileConnectionSelector))
