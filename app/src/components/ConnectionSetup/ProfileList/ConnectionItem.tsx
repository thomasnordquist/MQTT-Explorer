import React from 'react'
import { connect } from 'react-redux'
import { ListItem, Typography } from '@material-ui/core'
import { toMqttConnection, ConnectionOptions } from '../../../model/ConnectionOptions'
import { withStyles, Theme } from '@material-ui/core/styles'
import { bindActionCreators } from 'redux'
import { connectionManagerActions } from '../../../actions'

export interface Props {
  connection: ConnectionOptions
  actions: any
  selected: boolean
  classes: any
}

const ConnectionItem = (props: Props) => {
  const connection = props.connection.host && toMqttConnection(props.connection)
  return (
    <ListItem
      button={true}
      selected={props.selected}
      style={{ display: 'block' }}
      onClick={() => props.actions.selectConnection(props.connection.id)}
    >
      <Typography className={props.classes.name}>{props.connection.name || 'mqtt broker'}</Typography>
      <Typography className={props.classes.details}>{connection && connection.url}</Typography>
    </ListItem>
  )
}

export const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(connectionManagerActions, dispatch),
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
    color: theme.palette.text.hint,
    fontSize: '0.7em',
  },
})

export default connect(
  null,
  mapDispatchToProps
)(withStyles(connectionItemStyle)(ConnectionItem))
