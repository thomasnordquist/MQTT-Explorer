import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { List } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import ConnectionItem from './ConnectionItem'
import { AddButton } from './AddButton'
import { AppState } from '../../../reducers'
import { connectionManagerActions } from '../../../actions'
import { ConnectionOptions } from '../../../model/ConnectionOptions'
import { KeyCodes } from '../../../utils/KeyCodes'
import { useGlobalKeyEventHandler } from '../../../effects/useGlobalKeyEventHandler'

const ConnectionItemAny = ConnectionItem as any

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

  const createConnectionButton = (
    <div style={{ padding: '8px 16px' }}>
      <AddButton action={actions.createConnection} />
      Connections
    </div>
  )

  return (
    <List style={{ height: '100%' }} component="nav" subheader={createConnectionButton}>
      <div className={classes.list}>
        {Object.values(connections).map(connection => (
          <ConnectionItemAny connection={connection} key={connection.id} selected={selected === connection.id} />
        ))}
      </div>
    </List>
  )
}

const styles = (theme: Theme) => ({
  list: {
    marginTop: theme.spacing(1),
    height: `calc(100% - ${theme.spacing(6)})`,
    overflowY: 'auto' as const,
  },
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(connectionManagerActions, dispatch),
})

const mapStateToProps = (state: AppState) => ({
  connections: state.connectionManager.connections,
  selected: state.connectionManager.selected,
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProfileList) as any)
