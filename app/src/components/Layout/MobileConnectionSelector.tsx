import * as React from 'react'
import { useState, useEffect } from 'react'
import {
  Select,
  MenuItem,
  IconButton,
  Box,
  SelectChangeEvent,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { AppState } from '../../reducers'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { connectionManagerActions, globalActions } from '../../actions'
import { ConnectionOptions } from '../../model/ConnectionOptions'

const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1),
    maxWidth: '40%', // Leave space for search bar
    minWidth: '120px',
    // Only show on mobile (<=768px)
    [theme.breakpoints.up('md')]: {
      display: 'none' as 'none',
    },
  },
  select: {
    flex: 1,
    color: theme.palette.common.white,
    fontSize: '1rem', // Smaller font to save space
    fontWeight: 500,
    '& .MuiSelect-select': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: 0,
      paddingRight: theme.spacing(4),
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.common.white,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  addButton: {
    color: theme.palette.common.white,
    marginLeft: theme.spacing(1),
    padding: theme.spacing(1),
  },
  menuPaper: {
    maxHeight: '60vh',
  },
})

interface Props {
  classes: any
  connections: { [s: string]: ConnectionOptions }
  selected?: string
  connectionId?: string
  actions: {
    connectionManager: typeof connectionManagerActions
    global: typeof globalActions
  }
}

function MobileConnectionSelector(props: Props) {
  const { classes, connections, selected, connectionId, actions } = props
  const [currentConnectionId, setCurrentConnectionId] = useState<string | undefined>(selected)

  // Update local state when selected connection changes
  useEffect(() => {
    setCurrentConnectionId(selected)
  }, [selected])

  const handleConnectionChange = (event: SelectChangeEvent<string>) => {
    const newConnectionId = event.target.value
    setCurrentConnectionId(newConnectionId)
    actions.connectionManager.selectConnection(newConnectionId)
  }

  const handleAddConnection = () => {
    actions.connectionManager.createConnection()
    actions.global.toggleSettingsVisibility()
  }

  const connectionArray = Object.values(connections)
  const currentConnection = currentConnectionId
    ? connections[currentConnectionId]
    : connectionArray[0]

  if (connectionArray.length === 0) {
    return (
      <Box className={classes.container}>
        <span style={{ color: 'white', fontSize: '1.25rem' }}>No Connections</span>
        <IconButton
          className={classes.addButton}
          onClick={handleAddConnection}
          aria-label="Create new connection"
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box className={classes.container}>
      <Select
        value={currentConnection?.id || ''}
        onChange={handleConnectionChange}
        className={classes.select}
        variant="outlined"
        MenuProps={{
          classes: { paper: classes.menuPaper },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        }}
        inputProps={{
          'aria-label': 'Select MQTT connection',
        }}
      >
        {connectionArray.map((connection) => (
          <MenuItem key={connection.id} value={connection.id}>
            {connection.name || connection.host || 'Unnamed Connection'}
            {connectionId === connection.id && ' (Connected)'}
          </MenuItem>
        ))}
      </Select>
      <IconButton
        className={classes.addButton}
        onClick={handleAddConnection}
        aria-label="Create new connection"
        size="small"
      >
        <AddIcon />
      </IconButton>
    </Box>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    connections: state.connectionManager.connections,
    selected: state.connectionManager.selected,
    connectionId: state.connection.connectionId,
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
