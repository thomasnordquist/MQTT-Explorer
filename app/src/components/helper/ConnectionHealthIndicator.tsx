import * as React from 'react'
import DeviceHubOutlined from '@material-ui/icons/DeviceHubOutlined'
import { AppState } from '../../reducers'
import { connect } from 'react-redux'
import { ConnectionHealth } from '../../reducers/Connection'
import { green, orange, red } from '@material-ui/core/colors'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core'

const styles: StyleRulesCallback = theme => ({
  offline: {
    color: red[700],
  },
  online: {
    color: green[400],
  },
  connecting: {
    color: orange[600],
  },
  icon: {
    boxShadow: theme.shadows[2].split('),').map(s => `inset ${s}`).join('),'),
    padding: '6px',
    borderRadius: '50%',
    backgroundColor: '#eee',
    width: '35px',
    height: '35px',
  },
})

interface Props {
  classes: any
  connected: boolean
  health?: ConnectionHealth
  withBackground?: boolean
}

class ConnectionHealthIndicator extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
  }

  public render() {
    const { classes, health, connected } = this.props
    if (!health || !connected) {
      return null
    }

    return (
      <Tooltip title={`Connection health "${health}"`}>
        <div style={{ display: 'inherit' }}>
          <DeviceHubOutlined className={`${[classes[health]]} ${this.props.withBackground ? classes.icon : ''}`} />
        </div>
      </Tooltip>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    health: state.connection.health,
    connected: state.connection.connected || state.connection.connecting,
  }
}

export default connect(mapStateToProps)(withStyles(styles)(ConnectionHealthIndicator))
