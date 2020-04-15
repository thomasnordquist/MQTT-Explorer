import * as React from 'react'
import ConnectionSettings from './ConnectionSettings'
import ProfileList from './ProfileList'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions, toMqttConnection } from '../../model/ConnectionOptions'
import { Theme, withStyles } from '@material-ui/core/styles'
import { Modal, Paper, Toolbar, Typography, Collapse } from '@material-ui/core'
import AdvancedConnectionSettings from './AdvancedConnectionSettings'
import Certificates from './Certificates'

interface Props {
  actions: any
  classes: any
  connection?: ConnectionOptions
  visible: boolean
  showAdvancedSettings: boolean
  showCertificateSettings: boolean
}

class ConnectionSetup extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  private renderSettings() {
    const { connection, showAdvancedSettings, showCertificateSettings } = this.props
    if (!connection) {
      return null
    }

    return (
      <div>
        <Collapse in={!showAdvancedSettings && !showCertificateSettings}>
          <ConnectionSettings connection={connection} />
        </Collapse>
        <Collapse in={showAdvancedSettings && !showCertificateSettings}>
          <AdvancedConnectionSettings connection={connection} />
        </Collapse>
        <Collapse in={showCertificateSettings}>
          <Certificates connection={connection} />
        </Collapse>
      </div>
    )
  }

  public componentDidMount() {
    this.props.actions.loadConnectionSettings()
  }

  public render() {
    const { classes, visible, connection } = this.props
    const mqttConnection = connection && toMqttConnection(connection)
    return (
      <div>
        <Modal open={visible} disableAutoFocus={true}>
          <Paper className={classes.root}>
            <div className={classes.left}>
              <ProfileList />
            </div>
            <div className={classes.right} key={connection && connection.id}>
              <Toolbar>
                <Typography className={classes.title} variant="h6" color="inherit">
                  MQTT Connection
                </Typography>
                <Typography className={classes.connectionUri}>{mqttConnection && mqttConnection.url}</Typography>
              </Toolbar>
              {this.renderSettings()}
            </div>
          </Paper>
        </Modal>
      </div>
    )
  }
}

const connectionHeight = '440px'
const styles = (theme: Theme) => ({
  title: {
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap' as 'nowrap',
  },
  root: {
    margin: `calc((100vh - ${connectionHeight}) / 2) auto 0 auto`,
    minWidth: '800px',
    maxWidth: '850px',
    height: connectionHeight,
    outline: 'none' as 'none',
    display: 'flex' as 'flex',
  },
  left: {
    borderRightStyle: 'dotted' as 'dotted',
    borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
    paddingTop: theme.spacing(2),
    flex: 3,
    overflow: 'hidden' as 'hidden',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    overflowY: 'auto' as 'auto',
  },
  right: {
    borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    flex: 10,
  },
  connectionUri: {
    width: '27em',
    textOverflow: 'ellipsis' as 'ellipsis',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    color: theme.palette.text.hint,
    fontSize: '0.9em',
    marginLeft: theme.spacing(4),
  },
})

const mapStateToProps = (state: AppState) => {
  return {
    visible: !state.connection.connected,
    showAdvancedSettings: state.connectionManager.showAdvancedSettings,
    showCertificateSettings: state.connectionManager.showCertificateSettings,
    connection: state.connectionManager.selected
      ? state.connectionManager.connections[state.connectionManager.selected]
      : undefined,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(connectionManagerActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ConnectionSetup))
