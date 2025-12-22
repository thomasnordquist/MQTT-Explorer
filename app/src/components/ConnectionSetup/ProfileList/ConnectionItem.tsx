import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { ListItem, Typography } from '@mui/material'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { bindActionCreators } from 'redux'
import { toMqttConnection, ConnectionOptions } from '../../../model/ConnectionOptions'
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

function ConnectionItem(props: Props) {
  const connect = useCallback(() => {
    const mqttOptions = toMqttConnection(props.connection)
    if (mqttOptions) {
      props.actions.connection.connect(mqttOptions, props.connection.id)
    }
  }, [props.connection, props])

  const connection = props.connection.host && toMqttConnection(props.connection)
  return (
    <ListItem
      button
      selected={props.selected}
      style={{ display: 'block' }}
      onClick={() => props.actions.connectionManager.selectConnection(props.connection.id)}
      onDoubleClick={() => {
        props.actions.connectionManager.selectConnection(props.connection.id)
        connect()
      }}
    >
      <Typography className={props.classes.name}>{props.connection.name || 'mqtt broker'}</Typography>
      <Typography className={props.classes.details}>{connection && connection.url}</Typography>
    </ListItem>
  )
}

export const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    connection: bindActionCreators(connectionActions, dispatch),
    connectionManager: bindActionCreators(connectionManagerActions, dispatch),
  },
})
export const connectionItemStyle = (theme: Theme) => ({
  name: {
    width: '100%',
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
  },
  details: {
    width: '100%',
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    color: theme.palette.text.secondary,
    fontSize: '0.7em',
  },
})

export default connect(null, mapDispatchToProps)(withStyles(connectionItemStyle)(ConnectionItem) as any)
