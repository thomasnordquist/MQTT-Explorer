import * as React from 'react'
import * as q from '../../../backend/src/Model'

import { AppState } from '../reducers'
import { Typography } from '@material-ui/core'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'

import { connect } from 'react-redux'
const abbreviate = require('number-abbreviate')

interface Stats {
  topic: string
  title: string
}

const styles: StyleRulesCallback = theme => ({
  flex: {
    display: 'flex',
    width: '100%',
  },
  container: {
    width: '100%',
    height: '224px',
    backgroundColor: 'rebeccapurple',
    marginBottom: 0,
    marginTop: 'auto',
    padding: '8px',
  },
})

interface Props {
  classes: any
  tree?: q.Tree
}

class BrokerStatistics extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  public render() {
    const { tree, classes } = this.props
    if (!tree) {
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

    return (
      <div className={classes.container}>
        {this.renderStat(tree, stats.broker)}
        {this.renderPair(tree, stats.sent, stats.received)}
        {this.renderPair(tree, stats.clients, stats.subscriptions)}
        {this.renderPair(tree, stats.sent5m, stats.received5m)}
        {this.renderPair(tree, stats.heap, stats.heapMax)}
      </div>
    )
  }

  private renderPair(tree: q.Tree, a: Stats, b: Stats) {
    return (
      <div className={this.props.classes.flex}>
        <div style={{ flex: 1 }}>{this.renderStat(tree, a)}</div>
        <div style={{ flex: 1 }}>{this.renderStat(tree, b)}</div>
      </div>
    )
  }

  public renderStat(tree: q.Tree, stat: Stats) {
    const node = tree.findNode(stat.topic)
    if (!node) {
      return null
    }

    let value = node.message && node.message.value
    value = !isNaN(value) ? abbreviate(value) : value

    return (
      <div key={stat.title}>
        <Typography><b>{stat.title}</b></Typography>
        <Typography style={{ paddingLeft: '8px' }}><i>{value}</i></Typography>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    tree: state.connection.tree,
  }
}

export default withStyles(styles)(connect(mapStateToProps)(BrokerStatistics))
