import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { ListItem, Typography, Box } from '@mui/material'
import { DragIndicator } from '@mui/icons-material'
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
  onDragStart: (connectionId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (connectionId: string) => void
}

const ConnectionItem = (props: Props) => {
  const connect = useCallback(() => {
    const mqttOptions = toMqttConnection(props.connection)
    if (mqttOptions) {
      props.actions.connection.connect(mqttOptions, props.connection.id)
    }
  }, [props.connection, props])

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    props.onDragStart(props.connection.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    props.onDragOver(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    props.onDrop(props.connection.id)
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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box
        className={props.classes.dragHandle}
        draggable
        onDragStart={handleDragStart}
      >
        <DragIndicator fontSize="small" />
      </Box>
      <Box className={props.classes.textContainer}>
        <Typography className={props.classes.name}>{props.connection.name || 'mqtt broker'}</Typography>
        <Typography className={props.classes.details}>{connection && connection.url}</Typography>
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
    padding: '8px 8px 8px 8px',
  },
  textContainer: {
    flex: 1,
    overflow: 'hidden' as 'hidden',
  },
  dragHandle: {
    display: 'flex' as 'flex',
    alignItems: 'center' as 'center',
    marginRight: '8px',
    cursor: 'grab' as 'grab',
    color: theme.palette.text.secondary,
    '&:active': {
      cursor: 'grabbing' as 'grabbing',
    },
  },
})

export default connect(null, mapDispatchToProps)(withStyles(connectionItemStyle)(ConnectionItem) as any)
