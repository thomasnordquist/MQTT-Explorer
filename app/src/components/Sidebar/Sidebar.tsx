import * as q from '../../../../backend/src/Model'
import React, { useState, useEffect, useCallback } from 'react'
import ExpandMore from '@material-ui/icons/ExpandMore'
import NodeStats from './NodeStats'
import ValuePanel from './ValueRenderer/ValuePanel'
import { AppState } from '../../reducers'
import { Badge, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { settingsActions, sidebarActions } from '../../actions'
import { Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../model/TopicViewModel'
import TopicPanel from './TopicPanel/TopicPanel'
import Panel from './Panel'
import { usePollingToFetchTreeNode } from '../helper/usePollingToFetchTreeNode'

const throttle = require('lodash.throttle')

const Publish = React.lazy(() => import('./Publish/Publish'))

interface Props {
  nodePath?: string
  tree?: q.Tree<TopicViewModel>
  actions: typeof sidebarActions
  settingsActions: typeof settingsActions
  classes: any
  connectionId?: string
}

function useUpdateNodeWhenNodeReceivesUpdates(node?: q.TreeNode<any>) {
  const [lastUpdate, setLastUpdate] = useState(0)
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
  // console.log(node && node.path(), tree, nodePath)

  return (
    <div id="Sidebar" className={classes.drawer}>
      <div>
        <TopicPanel node={node} />
        <ValuePanel lastUpdate={node ? node.lastUpdate : 0} />
        <Panel>
          <span>Publish</span>
          <Publish connectionId={props.connectionId} />
        </Panel>
        <Panel detailsHidden={!node}>
          <span>Stats</span>
          <ExpansionPanelDetails className={classes.details}>
            <NodeStats node={node} />
          </ExpansionPanelDetails>
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
