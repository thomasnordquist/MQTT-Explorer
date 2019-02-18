import * as React from 'react'
import DeviceHubOutlined from '@material-ui/icons/DeviceHubOutlined'
import { AppState } from '../reducers'
import { connect } from 'react-redux'
import { ConnectionHealth } from '../reducers/Connection'
import { green, orange, red } from '@material-ui/core/colors'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'

const styles: StyleRulesCallback = theme => ({
  offline: {
    color: red[700],
  },
  online: {
    color: green[500],
  },
  connecting: {
    color: orange[600],
  },
})

interface Props {
  classes: any
  connected: boolean
  health?: ConnectionHealth
}

class ConnectionHealthIndicator extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
  }

  public render() {
    const { classes, health, connected } = this.props
    if (!health || !connected) {
      return null
    }

    return (
      <Tooltip title={`Connection health "${health}"`}>
        <DeviceHubOutlined className={classes[health]} />
      </Tooltip>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    health: state.connection.health,
    connected: state.connection.connected || state.connection.connecting,
  }
}

export default connect(mapStateToProps)(withStyles(styles)(ConnectionHealthIndicator))
