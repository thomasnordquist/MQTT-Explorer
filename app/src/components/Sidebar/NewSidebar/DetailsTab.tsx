import * as q from '../../../../../backend/src/Model'
import React, { useCallback } from 'react'
import { Box, Typography, Divider, IconButton, Chip, Tooltip } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { AppState } from '../../../reducers'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { sidebarActions } from '../../../actions'
import Copy from '../../helper/Copy'
import Save from '../../helper/Save'
import DateFormatter from '../../helper/DateFormatter'
import ValueRenderer from '../ValueRenderer/ValueRenderer'
import MessageHistory from '../ValueRenderer/MessageHistory'
import ActionButtons from '../ValueRenderer/ActionButtons'
import DeleteSelectedTopicButton from '../ValueRenderer/DeleteSelectedTopicButton'
import { MessageId } from '../MessageId'
import { useDecoder } from '../../hooks/useDecoder'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import Topic from '../TopicPanel/Topic'

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
    [compareMessage]
  )

  const deleteTopic = useCallback((topic?: q.TreeNode<any>, recursive: boolean = false) => {
    if (!topic) {
      return
    }
    props.sidebarActions.clearTopic(topic, recursive)
  }, [])

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
      {/* Topic Section */}
      <Box className={classes.section}>
        <Box className={classes.sectionHeader}>
          <Typography variant="subtitle2" className={classes.sectionTitle}>
            Topic Path
          </Typography>
          <Box className={classes.actions}>
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
        <Box className={classes.topicBreadcrumb}>
          <Topic node={node} />
        </Box>
      </Box>

      <Divider className={classes.divider} />

      {/* Value Section */}
      {hasValue && (
        <>
          <Box className={classes.section}>
            <Box className={classes.sectionHeader}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Message Value
              </Typography>
              <Box className={classes.actions}>
                <Copy getValue={getDecodedValue} />
                <Save getData={getData} />
              </Box>
            </Box>

            {/* Message Metadata */}
            <Box className={classes.metadata}>
              <Box className={classes.metadataRow}>
                <Chip
                  label={`QoS ${node.message?.qos ?? 0}`}
                  size="small"
                  variant="outlined"
                  className={classes.chip}
                />
                {node.message?.retain && (
                  <Chip label="Retained" size="small" variant="outlined" color="primary" className={classes.chip} />
                )}
                <MessageId message={node.message!} />
              </Box>
              <Typography variant="caption" color="textSecondary">
                <DateFormatter date={node.message!.received} />
              </Typography>
            </Box>

            {/* View Mode Toggle */}
            <Box className={classes.viewModeContainer}>
              <ActionButtons />
              {node.message?.retain && <DeleteSelectedTopicButton />}
            </Box>

            {/* Value Display */}
            <Box className={classes.valueDisplay}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <ValueRenderer treeNode={node} message={node.message!} compareWith={compareMessage} />
              </React.Suspense>
            </Box>

            {/* Message History */}
            <Box className={classes.historyContainer}>
              <MessageHistory onSelect={handleMessageHistorySelect} selected={compareMessage} node={node} />
            </Box>
          </Box>

          <Divider className={classes.divider} />
        </>
      )}

      {/* Stats Section */}
      <Box className={classes.section}>
        <Typography variant="subtitle2" className={classes.sectionTitle}>
          Statistics
        </Typography>
        <Box className={classes.statsGrid}>
          <Box className={classes.statItem}>
            <Typography variant="h6" className={classes.statValue}>
              {node.messages}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Messages
            </Typography>
          </Box>
          <Box className={classes.statItem}>
            <Typography variant="h6" className={classes.statValue}>
              {node.childTopicCount()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Subtopics
            </Typography>
          </Box>
          <Box className={classes.statItem}>
            <Typography variant="h6" className={classes.statValue}>
              {node.leafMessageCount()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total Messages
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: theme.spacing(0),
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },
  sectionTitle: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.5px',
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },
  iconButton: {
    padding: theme.spacing(0.5),
  },
  topicBreadcrumb: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    minHeight: '44px', // Touch-friendly
    display: 'flex',
    alignItems: 'center',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  metadata: {
    marginBottom: theme.spacing(1.5),
  },
  metadataRow: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    flexWrap: 'wrap' as 'wrap',
  },
  chip: {
    height: '24px',
  },
  viewModeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
    flexWrap: 'wrap' as 'wrap',
  },
  valueDisplay: {
    marginBottom: theme.spacing(2),
  },
  historyContainer: {
    marginTop: theme.spacing(1),
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(3, 1fr)', // Keep 3 columns even on mobile for compactness
      gap: theme.spacing(1),
    },
  },
  statItem: {
    textAlign: 'center' as 'center',
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DetailsTab) as any)
