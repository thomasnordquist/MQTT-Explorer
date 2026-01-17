import ConnectionItem from './ConnectionItem'
const ConnectionItemAny = ConnectionItem as any
import React, { useState } from 'react'
import { AddButton } from './AddButton'
import { AppState } from '../../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../../actions'
import { ConnectionOptions } from '../../../model/ConnectionOptions'
import { KeyCodes } from '../../../utils/KeyCodes'
import { List } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { useGlobalKeyEventHandler } from '../../../effects/useGlobalKeyEventHandler'

interface Props {
  classes: any
  selected?: string
  connections: { [s: string]: ConnectionOptions }
  actions: typeof connectionManagerActions
}

function ProfileList(props: Props) {
  const { actions, classes, connections, selected } = props
  const [draggedConnectionId, setDraggedConnectionId] = useState<string | null>(null)

  const selectConnection = (dir: 'next' | 'previous') => (event: KeyboardEvent) => {
    if (!selected) {
      return
    }
    const indexDirection = dir === 'next' ? 1 : -1
    const connectionArray = Object.values(connections).sort((a, b) => (a.order || 0) - (b.order || 0))
    const selectedIndex = connectionArray.map(connection => connection.id).indexOf(selected)
    const nextConnection = connectionArray[selectedIndex + indexDirection]
    if (nextConnection) {
      actions.selectConnection(nextConnection.id)
    }
    event.preventDefault()
  }

  useGlobalKeyEventHandler(KeyCodes.arrow_down, selectConnection('next'))
  useGlobalKeyEventHandler(KeyCodes.arrow_up, selectConnection('previous'))

  const handleDragStart = (connectionId: string) => {
    setDraggedConnectionId(connectionId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetConnectionId: string) => {
    if (!draggedConnectionId || draggedConnectionId === targetConnectionId) {
      setDraggedConnectionId(null)
      return
    }

    const sortedConnections = Object.values(connections).sort((a, b) => (a.order || 0) - (b.order || 0))
    const draggedIndex = sortedConnections.findIndex(c => c.id === draggedConnectionId)
    const targetIndex = sortedConnections.findIndex(c => c.id === targetConnectionId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedConnectionId(null)
      return
    }

    // Swap order values
    const draggedConnection = sortedConnections[draggedIndex]
    const targetConnection = sortedConnections[targetIndex]

    actions.updateConnection(draggedConnection.id, { order: targetConnection.order })
    actions.updateConnection(targetConnection.id, { order: draggedConnection.order })
    
    setDraggedConnectionId(null)
  }

  const createConnectionButton = (
    <div style={{ padding: '8px 16px' }}>
      <AddButton action={actions.createConnection} />
      Connections
    </div>
  )

  return (
    <List style={{ height: '100%' }} component="nav" subheader={createConnectionButton}>
      <div className={classes.list}>
        {Object.values(connections)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(connection => (
            <ConnectionItemAny
              connection={connection}
              key={connection.id}
              selected={selected === connection.id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProfileList) as any)
