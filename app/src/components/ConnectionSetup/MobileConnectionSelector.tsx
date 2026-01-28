import * as React from 'react'
import Add from '@mui/icons-material/Add'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { IconButton, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { connectionManagerActions } from '../../actions'
import { AppState } from '../../reducers'

const styles = (theme: Theme) => ({
  container: {
    display: 'none',
    // Only show on mobile, takes full width
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  },
  select: {
    flex: 1,
    fontSize: '1rem',
    '& .MuiSelect-select': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  },
  addButton: {
    padding: theme.spacing(1),
  },
})

interface Props {
  classes: any
  connections: Array<{ id: string; name?: string; host?: string }>
  currentConnectionId?: string
  isConnected: boolean
  currentActiveConnectionId?: string
  actions: typeof connectionManagerActions
}

class MobileConnectionSelector extends React.PureComponent<Props, {}> {
  private handleConnectionChange = (event: SelectChangeEvent<string>) => {
    const connectionId = event.target.value
    this.props.actions.selectConnection(connectionId)
  }

  private handleCreateConnection = () => {
    this.props.actions.createConnection()
  }

  private getConnectionDisplayName = (connection: { name?: string; host?: string }) =>
    connection.name || connection.host || 'Unnamed Connection'

  public render() {
    const { classes, connections, currentConnectionId, isConnected, currentActiveConnectionId } = this.props

    if (!connections || connections.length === 0) {
      return null
    }

    return (
      <div className={classes.container}>
        <Select
          className={classes.select}
          value={currentConnectionId || ''}
          onChange={this.handleConnectionChange}
          aria-label="Select MQTT connection"
          displayEmpty
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: '60vh',
              },
            },
          }}
        >
          {connections.map(conn => {
            // Show "(Connected)" only when:
            // 1. This connection is selected in the UI (currentConnectionId)
            // 2. There's an active MQTT connection (isConnected)
            // 3. The active connection matches this connection (currentActiveConnectionId)
            // This prevents showing "Connected" when a connection is selected but not connected,
            // or when switching between connections during a disconnect/reconnect cycle.
            const showConnectedStatus =
              conn.id === currentConnectionId && isConnected && conn.id === currentActiveConnectionId
            const displayName = this.getConnectionDisplayName(conn)
            return (
              <MenuItem key={conn.id} value={conn.id}>
                {displayName}
                {showConnectedStatus && ' (Connected)'}
              </MenuItem>
            )
          })}
        </Select>
        <IconButton
          className={classes.addButton}
          onClick={this.handleCreateConnection}
          aria-label="Create new connection"
          size="medium"
        >
          <Add />
        </IconButton>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  const { connectionManager } = state
  const connections =
    connectionManager && connectionManager.connections
      ? Object.values(connectionManager.connections).map(conn => ({
          id: conn.id,
          name: conn.name,
          host: conn.host,
        }))
      : []

  return {
    connections,
    currentConnectionId: state.connectionManager?.selected,
    isConnected: state.connection.connected,
    currentActiveConnectionId: state.connection.connectionId,
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(connectionManagerActions, dispatch),
})

// Using 'as any' here is consistent with other Material-UI + Redux connected components
// in this codebase (see ConnectionSettings.tsx, ProfileList/index.tsx, ChartPanel/index.tsx)
// to work around complex TypeScript type inference issues with the withStyles + connect HOCs
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MobileConnectionSelector) as any)
