import * as React from 'react'
import { AddButton } from './AddButton'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions, toMqttConnection } from '../../model/ConnectionOptions'
import { Theme, withStyles } from '@material-ui/core/styles'
import {
  List,
  ListItem,
  ListSubheader,
  Typography,
} from '@material-ui/core'

interface Props {
  classes: any
  selected?: string
  connections: {[s: string]: ConnectionOptions}
  actions: any
}

class ProfileList extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  private addConnectionButton() {
    return <span id="addProfileButton" style={{ marginRight: '12px' }}><AddButton action={this.props.actions.createConnection} /></span>
  }

  public render() {
    return (
      <List
        style={{ height: '100%' }}
        component="nav"
        subheader={<ListSubheader component="div">{this.addConnectionButton()}Connections</ListSubheader>}
      >
        <div className={this.props.classes.list}>
          {Object.values(this.props.connections).map(connection => <ConnectionItem connection={connection} key={connection.id} selected={this.props.selected === connection.id} />)}
        </div>
      </List>
    )
  }
}

const styles = (theme: Theme) => ({
  list: {
    marginTop: theme.spacing(1),
    height: `calc(100% - ${theme.spacing(6)})`,
    overflowY: 'auto' as 'auto',
  },
})

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(connectionManagerActions, dispatch),
  }
}

interface ConnectionItemProps {
  connection: ConnectionOptions,
  actions: any,
  selected: boolean,
  classes: any
}

const connectionItemStyle = (theme: Theme) => ({
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

const connectionItemRenderer = withStyles(connectionItemStyle)((props: ConnectionItemProps) => {
  const connection = props.connection.host && toMqttConnection(props.connection)
  return (
    <ListItem
      button={true}
      selected={props.selected}
      style={{ display: 'block' }}
      onClick={() => props.actions.selectConnection(props.connection.id)}
    >
      <Typography className={props.classes.name}>
        {props.connection.name || 'mqtt broker'}
      </Typography>
      <Typography className={props.classes.details}>
        {connection && connection.url}
      </Typography>
    </ListItem>
  )
})

const ConnectionItem = connect(null, mapDispatchToProps)(connectionItemRenderer)

const mapStateToProps = (state: AppState) => {
  return {
    connections: state.connectionManager.connections,
    selected: state.connectionManager.selected,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProfileList))
