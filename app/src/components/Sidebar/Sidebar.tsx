import * as q from '../../../../backend/src/Model'
import React, { useState, useEffect, useCallback } from 'react'
import NodeStats from './NodeStats'
import ValuePanel from './ValueRenderer/ValuePanel'
const ValuePanelAny = ValuePanel as any
import { AppState } from '../../reducers'
import { AccordionDetails, Button } from '@mui/material'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { globalActions, settingsActions, sidebarActions } from '../../actions'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { TopicViewModel } from '../../model/TopicViewModel'
import TopicPanel from './TopicPanel/TopicPanel'
import Panel from './Panel'
import { usePollingToFetchTreeNode } from '../helper/usePollingToFetchTreeNode'
import Info from '@mui/icons-material/Info'

const throttle = require('lodash.throttle')

const Publish = React.lazy(() => import('./Publish/Publish'))

interface Props {
  nodePath?: string
  tree?: q.Tree<TopicViewModel>
  actions: typeof sidebarActions
  globalActions: typeof globalActions
  settingsActions: typeof settingsActions
  classes: any
  connectionId?: string
}

function useUpdateNodeWhenNodeReceivesUpdates(node?: q.TreeNode<any>) {
  const [, setLastUpdate] = useState(0)
  const updateNode = useCallback(
    throttle(() => {
      setLastUpdate(node ? node.lastUpdate : 0)
    }, 300),
    [node]
  )

  useEffect(() => {
    const updateCallback = updateNode
    node && node.onMerge.subscribe(updateCallback)
    node && node.onMessage.subscribe(updateCallback)

    return function cleanup() {
      node && node.onMerge.unsubscribe(updateCallback)
      node && node.onMessage.unsubscribe(updateCallback)
    }
  }, [node])
}

function Sidebar(props: Props) {
  const { classes, tree, nodePath } = props
  const node = usePollingToFetchTreeNode(tree, nodePath || '')
  useUpdateNodeWhenNodeReceivesUpdates(node)

  return (
    <div id="Sidebar" className={classes.drawer}>
      <div>
        <TopicPanel node={node} />
        <ValuePanelAny lastUpdate={node ? node.lastUpdate : 0} />
        <Panel>
          <span>Publish</span>
          <Publish connectionId={props.connectionId} />
        </Panel>
        <Panel detailsHidden={!node}>
          <span>Stats</span>
          <AccordionDetails className={classes.details}>
            <NodeStats node={node} />
          </AccordionDetails>
        </Panel>
        <Panel>
          <span>About</span>
          <AccordionDetails className={classes.details}>
            <Button
              variant="text"
              size="small"
              startIcon={<Info />}
              onClick={() => props.globalActions.toggleAboutDialogVisibility()}
              fullWidth
            >
              About MQTT Explorer
            </Button>
          </AccordionDetails>
        </Panel>
      </div>
    </div>
  )
}

const mapStateToProps = (state: AppState) => {
  const node = state.tree.get('selectedTopic')
  return {
    tree: state.connection.tree,
    nodePath: node && node.path(),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(sidebarActions, dispatch),
    globalActions: bindActionCreators(globalActions, dispatch),
    settingsActions: bindActionCreators(settingsActions, dispatch),
  }
}

const styles = (theme: Theme) => ({
  drawer: {
    display: 'block' as 'block',
  },
  details: {
    padding: '0px 16px 8px 8px',
    display: 'block',
  },
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Sidebar))
