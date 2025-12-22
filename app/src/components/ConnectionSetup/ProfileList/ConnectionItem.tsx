import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { ListItem, Typography, IconButton, Box } from '@mui/material'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'
import { toMqttConnection, ConnectionOptions } from '../../../model/ConnectionOptions'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { bindActionCreators } from 'redux'
import { connectionActions, connectionManagerActions } from '../../../actions'

export interface Props {
  connection: ConnectionOptions
  actions: {
    connection: any
    connectionManager: any
  }
  selected: boolean
  classes: any
}

const ConnectionItem = (props: Props) => {
  const connect = useCallback(() => {
    const mqttOptions = toMqttConnection(props.connection)
    if (mqttOptions) {
      props.actions.connection.connect(mqttOptions, props.connection.id)
    }
  }, [props.connection, props])

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    props.actions.connectionManager.moveConnection(props.connection.id, 'up')
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    props.actions.connectionManager.moveConnection(props.connection.id, 'down')
  }

  const connection = props.connection.host && toMqttConnection(props.connection)
  return (
    <ListItem
      button={true}
      selected={props.selected}
      className={props.classes.itemContainer}
      onClick={() => props.actions.connectionManager.selectConnection(props.connection.id)}
      onDoubleClick={() => {
        props.actions.connectionManager.selectConnection(props.connection.id)
        connect()
      }}
    >
      <Box className={props.classes.textContainer}>
        <Typography className={props.classes.name}>{props.connection.name || 'mqtt broker'}</Typography>
        <Typography className={props.classes.details}>{connection && connection.url}</Typography>
      </Box>
      <Box className={props.classes.buttonContainer}>
        <IconButton size="small" onClick={handleMoveUp} className={props.classes.arrowButton}>
          <ArrowUpward fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleMoveDown} className={props.classes.arrowButton}>
          <ArrowDownward fontSize="small" />
        </IconButton>
      </Box>
    </ListItem>
  )
}

export const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      connection: bindActionCreators(connectionActions, dispatch),
      connectionManager: bindActionCreators(connectionManagerActions, dispatch),
    },
  }
}
export const connectionItemStyle = (theme: Theme) => ({
  name: {
    width: '100%',
    textOverflow: 'ellipsis' as 'ellipsis',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
  },
  details: {
    width: '100%',
    textOverflow: 'ellipsis' as 'ellipsis',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    color: theme.palette.text.secondary,
    fontSize: '0.7em',
  },
  itemContainer: {
    display: 'flex' as 'flex',
    alignItems: 'center' as 'center',
    padding: '8px 8px 8px 16px',
  },
  textContainer: {
    flex: 1,
    overflow: 'hidden' as 'hidden',
  },
  buttonContainer: {
    display: 'flex' as 'flex',
    flexDirection: 'column' as 'column',
    marginLeft: '4px',
  },
  arrowButton: {
    padding: '2px',
  },
})

export default connect(null, mapDispatchToProps)(withStyles(connectionItemStyle)(ConnectionItem) as any)
