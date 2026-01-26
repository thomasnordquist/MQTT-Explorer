import * as q from '../../../../backend/src/Model'
import React, { useState, useEffect, useCallback } from 'react'
import { AppState } from '../../reducers'
<<<<<<< HEAD
import { AccordionDetails, Button } from '@mui/material'
=======
>>>>>>> origin/master
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { globalActions, settingsActions, sidebarActions } from '../../actions'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { TopicViewModel } from '../../model/TopicViewModel'
import { usePollingToFetchTreeNode } from '../helper/usePollingToFetchTreeNode'
<<<<<<< HEAD
import Info from '@mui/icons-material/Info'
=======
import { Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material'
import DetailsTab from './DetailsTab'
import PublishTab from './PublishTab'
>>>>>>> origin/master

const throttle = require('lodash.throttle')

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

function SidebarNew(props: Props) {
  const { classes, tree, nodePath } = props
  const node = usePollingToFetchTreeNode(tree, nodePath || '')
  useUpdateNodeWhenNodeReceivesUpdates(node)
  const [tabValue, setTabValue] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

<<<<<<< HEAD
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
=======
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // On mobile, don't show tabs (mobile already has Topics/Details tabs at app level)
  // Just show the content directly
  if (isMobile) {
    return (
      <div id="Sidebar" className={classes.root}>
        <Box className={classes.mobileContent}>
          <DetailsTab node={node} />
        </Box>
>>>>>>> origin/master
      </div>
    )
  }

  // Desktop: show tabs for Details/Publish
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
        <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
          <DetailsTab node={node} />
        </Box>
        <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
          <PublishTab connectionId={props.connectionId} />
        </Box>
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
    globalActions: bindActionCreators(globalActions, dispatch),
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
  },
  tabContent: {
    flex: 1,
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
    padding: theme.spacing(2),
  },
  mobileContent: {
    flex: 1,
    overflowY: 'auto' as 'auto',
    overflowX: 'hidden' as 'hidden',
    padding: theme.spacing(2),
  },
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(SidebarNew))
