import * as q from '../../../../backend/src/Model'
import React, { useState, useEffect, useCallback } from 'react'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { settingsActions, sidebarActions } from '../../actions'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { TopicViewModel } from '../../model/TopicViewModel'
import { usePollingToFetchTreeNode } from '../helper/usePollingToFetchTreeNode'
import { Tabs, Tab, Box } from '@mui/material'
import DetailsTab from './NewSidebar/DetailsTab'
import PublishTab from './NewSidebar/PublishTab'

const throttle = require('lodash.throttle')

interface Props {
  nodePath?: string
  tree?: q.Tree<TopicViewModel>
  actions: typeof sidebarActions
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

function SidebarNew(props: Props) {
  const { classes, tree, nodePath } = props
  const node = usePollingToFetchTreeNode(tree, nodePath || '')
  useUpdateNodeWhenNodeReceivesUpdates(node)
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <div id="Sidebar" className={classes.root}>
      <Box className={classes.tabsContainer}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          className={classes.tabs}
        >
          <Tab label="Details" className={classes.tab} />
          <Tab label="Publish" className={classes.tab} />
        </Tabs>
      </Box>
      
      <Box className={classes.tabContent}>
        {tabValue === 0 && <DetailsTab node={node} />}
        {tabValue === 1 && <PublishTab connectionId={props.connectionId} />}
      </Box>
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
  root: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: '100%',
    width: '100%',
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  tabs: {
    minHeight: '48px',
  },
  tab: {
    minHeight: '48px',
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'none' as 'none',
    padding: theme.spacing(1.5, 2),
    [theme.breakpoints.down('sm')]: {
      minHeight: '56px', // Touch-friendly on mobile
      fontSize: '16px', // Prevent iOS zoom
    },
  },
  tabContent: {
    flex: 1,
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(SidebarNew))
