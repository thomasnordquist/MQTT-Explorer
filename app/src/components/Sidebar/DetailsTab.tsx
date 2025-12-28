import * as q from '../../../../backend/src/Model'
import React, { useCallback } from 'react'
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { AppState } from '../../reducers'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { sidebarActions } from '../../actions'
import Copy from '../helper/Copy'
import Save from '../helper/Save'
import DateFormatter from '../helper/DateFormatter'
import ValueRenderer from './ValueRenderer/ValueRenderer'
import MessageHistory from './ValueRenderer/MessageHistory'
import ActionButtons from './ValueRenderer/ActionButtons'
import DeleteSelectedTopicButton from './ValueRenderer/DeleteSelectedTopicButton'
import { useDecoder } from '../hooks/useDecoder'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import SimpleBreadcrumb from './SimpleBreadcrumb'

interface Props {
  node?: q.TreeNode<any>
  classes: any
  compareMessage?: q.Message
  sidebarActions: typeof sidebarActions
}

function DetailsTab(props: Props) {
  const { node, compareMessage, classes } = props
  const decodeMessage = useDecoder(node)

  const getDecodedValue = useCallback(() => {
    return node?.message && decodeMessage(node.message)?.message?.toUnicodeString()
  }, [node, decodeMessage])

  const getData = () => {
    if (node?.message && node.message.payload) {
      return node.message.payload.base64Message
    }
  }

  const handleMessageHistorySelect = useCallback(
    (message: q.Message) => {
      if (message !== compareMessage) {
        props.sidebarActions.setCompareMessage(message)
      } else {
        props.sidebarActions.setCompareMessage(undefined)
      }
    },
    [compareMessage, props.sidebarActions]
  )

  const deleteTopic = useCallback(
    (topic?: q.TreeNode<any>, recursive: boolean = false) => {
      if (!topic) {
        return
      }
      props.sidebarActions.clearTopic(topic, recursive)
    },
    [props.sidebarActions]
  )

  if (!node) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body2" color="textSecondary" align="center">
          Select a topic to view details
        </Typography>
      </Box>
    )
  }

  const [value] =
    node && node.message && node.message.payload ? node.message.payload?.format(node.type) : [null, undefined]
  const hasValue = Boolean(value)

  return (
    <Box className={classes.root}>
      {/* Topic Section - Breadcrumb with actions */}
      <Box className={classes.topicSection}>
        <SimpleBreadcrumb node={node} />
        <Box className={classes.topicActions}>
          <Copy value={node.path()} />
          {node.childTopicCount() === 0 && (
            <Tooltip title="Delete this topic">
              <IconButton size="small" onClick={() => deleteTopic(node, false)} className={classes.iconButton}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {node.childTopicCount() > 0 && (
            <Tooltip title="Delete topic and all subtopics">
              <IconButton size="small" onClick={() => deleteTopic(node, true)} className={classes.iconButton}>
                <DeleteSweepIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Stats Section - Moved up for better hierarchy */}
      <Box className={classes.statsSection}>
        <Box className={classes.statsGrid}>
          <Box className={classes.statItem}>
            <Typography variant="body2" color="textSecondary" className={classes.statLabel}>
              Messages
            </Typography>
            <Typography variant="h6" className={classes.statValue}>
              {node.messages}
            </Typography>
          </Box>
          <Box className={classes.statItem}>
            <Typography variant="body2" color="textSecondary" className={classes.statLabel}>
              Subtopics
            </Typography>
            <Typography variant="h6" className={classes.statValue}>
              {node.childTopicCount()}
            </Typography>
          </Box>
          <Box className={classes.statItem}>
            <Typography variant="body2" color="textSecondary" className={classes.statLabel}>
              Total
            </Typography>
            <Typography variant="h6" className={classes.statValue}>
              {node.leafMessageCount()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Value Section - Simplified layout */}
      {hasValue && (
        <Box className={classes.valueSection}>
          {/* Metadata bar */}
          <Box className={classes.metadataBar}>
            <Box className={classes.metadataLeft}>
              <Chip
                label={`QoS ${node.message?.qos ?? 0}`}
                size="small"
                variant="outlined"
                className={classes.chip}
              />
              {node.message?.retain && (
                <Chip label="Retained" size="small" variant="outlined" color="primary" className={classes.chip} />
              )}
            </Box>
            <Box className={classes.metadataRight}>
              <Typography variant="caption" color="textSecondary">
                <DateFormatter date={node.message!.received} />
              </Typography>
            </Box>
          </Box>

          {/* Action toolbar */}
          <Box className={classes.actionToolbar}>
            <Box className={classes.actionButtons}>
              <ActionButtons />
            </Box>
            <Box className={classes.valueActions}>
              <Copy getValue={getDecodedValue} />
              <Save getData={getData} />
              {node.message?.retain && <DeleteSelectedTopicButton />}
            </Box>
          </Box>

          {/* Value Display */}
          <Box className={classes.valueDisplay}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ValueRenderer treeNode={node} message={node.message!} compareWith={compareMessage} />
            </React.Suspense>
          </Box>

          {/* Message History */}
          <Box className={classes.historySection}>
            <MessageHistory onSelect={handleMessageHistorySelect} selected={compareMessage} node={node} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(2),
    },
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: theme.spacing(3),
  },
  // Topic section
  topicSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  topicActions: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
    flexShrink: 0,
  },
  iconButton: {
    padding: theme.spacing(0.5),
  },
  // Stats section
  statsSection: {
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1),
    },
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5, 1),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    gap: theme.spacing(0.5),
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1,
  },
  // Value section
  valueSection: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: theme.spacing(2),
  },
  metadataBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap' as 'wrap',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
  metadataLeft: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    flexWrap: 'wrap' as 'wrap',
  },
  metadataRight: {
    display: 'flex',
    alignItems: 'center',
  },
  chip: {
    height: '24px',
  },
  actionToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap' as 'wrap',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
  },
  valueActions: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },
  valueDisplay: {
    marginTop: theme.spacing(1),
  },
  historySection: {
    marginTop: theme.spacing(1),
  },
})

const mapStateToProps = (state: AppState) => {
  return {
    compareMessage: state.sidebar.get('compareMessage'),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    sidebarActions: bindActionCreators(sidebarActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DetailsTab))
