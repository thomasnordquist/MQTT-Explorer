import ConnectionItem from './ConnectionItem'
import React from 'react'
import { AddButton } from './AddButton'
import { AppState } from '../../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../../actions'
import { ConnectionOptions } from '../../../model/ConnectionOptions'
import { List, ListSubheader } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

interface Props {
  classes: any
  selected?: string
  connections: { [s: string]: ConnectionOptions }
  actions: any
}

function ProfileList(props: Props) {
  const { actions, classes, connections, selected } = props

  return (
    <List
      style={{ height: '100%' }}
      component="nav"
      subheader={
        <ListSubheader component="div">
          <AddButton action={actions.createConnection} />
          Connections
        </ListSubheader>
      }
    >
      <div className={classes.list}>
        {Object.values(connections).map(connection => (
          <ConnectionItem connection={connection} key={connection.id} selected={selected === connection.id} />
        ))}
      </div>
    </List>
  )
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

const mapStateToProps = (state: AppState) => {
  return {
    connections: state.connectionManager.connections,
    selected: state.connectionManager.selected,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ProfileList))
