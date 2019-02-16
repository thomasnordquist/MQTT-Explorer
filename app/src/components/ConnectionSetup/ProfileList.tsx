import * as React from 'react'
import { AddButton } from './AddButton'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import { Theme, withStyles } from '@material-ui/core/styles'
import {
  List,
  ListItem,
  ListItemText,
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
    return <AddButton action={this.props.actions.createConnection} />
  }

  public render() {
    return (
      <List
        style={{ height: '100%' }}
        component="nav"
        subheader={<ListSubheader component="div">{this.addConnectionButton()} Connections</ListSubheader>}
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
    marginTop: `${theme.spacing.unit}px`,
    height: `calc(100% - ${theme.spacing.unit * 6}px)`,
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
}

const connectionItemRenderer = (props: ConnectionItemProps) => {
  return (
    <ListItem
      button={true}
      selected={props.selected}
      onClick={() => props.actions.selectConnection(props.connection.id)}
    >
      <Typography style={{ width: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {props.connection.name || 'mqtt broker'}
      </Typography>
    </ListItem>
  )
}

const ConnectionItem = connect(null, mapDispatchToProps)(connectionItemRenderer)

const mapStateToProps = (state: AppState) => {
  return {
    connections: state.connectionManager.connections,
    selected: state.connectionManager.selected,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProfileList))
