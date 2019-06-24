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
import { useGlobalKeyEventHandler } from '../../../effects/useGlobalKeyEventHandler'
import { KeyCodes } from '../../../utils/KeyCodes'

interface Props {
  classes: any
  selected?: string
  connections: { [s: string]: ConnectionOptions }
  actions: typeof connectionManagerActions
}

function ProfileList(props: Props) {
  const { actions, classes, connections, selected } = props

  const selectConnection = (dir: 'next' | 'previous') => (event: KeyboardEvent) => {
    if (!selected) {
      return
    }
    const indexDirection = dir === 'next' ? 1 : -1
    const connectionArray = Object.values(connections)
    const selectedIndex = connectionArray.map(connection => connection.id).indexOf(selected)
    const nextConnection = connectionArray[selectedIndex + indexDirection]
    if (nextConnection) {
      actions.selectConnection(nextConnection.id)
    }
    event.preventDefault()
  }

  useGlobalKeyEventHandler(KeyCodes.arrow_down, selectConnection('next'))
  useGlobalKeyEventHandler(KeyCodes.arrow_up, selectConnection('previous'))

  const createConectionButton = (
    <ListSubheader component="div">
      <AddButton action={actions.createConnection} />
      Connections
    </ListSubheader>
  )

  return (
    <List style={{ height: '100%' }} component="nav" subheader={createConectionButton}>
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
