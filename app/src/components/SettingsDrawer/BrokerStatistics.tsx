import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { Typography } from '@mui/material'
import * as q from '../../../../backend/src/Model'
import { Base64Message } from '../../../../backend/src/Model/Base64Message'
import { TopicViewModel } from '../../model/TopicViewModel'
import { AppState } from '../../reducers'
import { usePollingToFetchTreeNode } from '../helper/usePollingToFetchTreeNode'
import { useUpdateComponentWhenNodeUpdates } from '../helper/useUpdateComponentWhenNodeUpdates'

const abbreviate = require('number-abbreviate')

interface Stats {
  topic: string
  title: string
}

const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    height: '224px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rebeccapurple' : '#ebebeb',
    marginBottom: 0,
    padding: '8px',
  },
})

interface Props {
  classes: any
  tree?: q.Tree<TopicViewModel>
}

function BrokerStatistics(props: Props) {
  const { tree, classes } = props
  const sysTopic = usePollingToFetchTreeNode(props.tree, '$SYS')
  useUpdateComponentWhenNodeUpdates(sysTopic)

  return useMemo(() => {
    if (!sysTopic) {
      return null
    }

    const stats: any = {
      broker: {
        topic: '$SYS/broker/version',
        title: 'Broker',
      },
      clients: {
        topic: '$SYS/broker/clients/total',
        title: 'Clients',
      },
      subscriptions: {
        topic: '$SYS/broker/subscriptions/count',
        title: 'Subscriptions',
      },
      received: {
        topic: '$SYS/broker/messages/received',
        title: 'Received',
      },
      sent: {
        topic: '$SYS/broker/messages/sent',
        title: 'Sent',
      },
      received5m: {
        topic: '$SYS/broker/load/messages/received/5min',
        title: 'Received last 5min',
      },
      sent5m: {
        topic: '$SYS/broker/load/messages/sent/5min',
        title: 'Sent 5m',
      },
      heap: {
        topic: '$SYS/broker/heap/current',
        title: 'Memory',
      },
      heapMax: {
        topic: '$SYS/broker/heap/maximum',
        title: 'Memory (max)',
      },
    }

    if (!tree) {
      return null
    }

    return (
      <div className={classes.container}>
        {renderStat(tree, stats.broker)}
        {renderPair(tree, stats.sent, stats.received)}
        {renderPair(tree, stats.clients, stats.subscriptions)}
        {renderPair(tree, stats.sent5m, stats.received5m)}
        {renderPair(tree, stats.heap, stats.heapMax)}
      </div>
    )
  }, [sysTopic && sysTopic.lastUpdate, props.classes])
}

const mapStateToProps = (state: AppState) => ({
  tree: state.connection.tree,
})

export default withStyles(styles)(connect(mapStateToProps)(BrokerStatistics))

function renderPair(tree: q.Tree<TopicViewModel>, a: Stats, b: Stats) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
      }}
    >
      <div style={{ flex: 1 }}>{renderStat(tree, a)}</div>
      <div style={{ flex: 1 }}>{renderStat(tree, b)}</div>
    </div>
  )
}

function renderStat(tree: q.Tree<TopicViewModel>, stat: Stats) {
  const node = tree.findNode(stat.topic)
  if (!node || !node.message) {
    return null
  }

  const str = node.message.payload ? node.message.payload.toUnicodeString() : ''
  let value = node.message && node.message.payload ? parseFloat(str) : NaN
  value = !isNaN(value) ? abbreviate(value) : str

  return (
    <div key={stat.title}>
      <Typography>
        <b>{stat.title}</b>
      </Typography>
      <Typography style={{ paddingLeft: '8px' }}>
        <i>{value}</i>
      </Typography>
    </div>
  )
}
