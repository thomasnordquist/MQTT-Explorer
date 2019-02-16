import * as React from 'react'
import ConnectionSettings from './ConnectionSettings'
import ProfileList from './ProfileList'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import { Theme, withStyles } from '@material-ui/core/styles'
import {
  Modal,
  Paper,
  Toolbar,
  Typography,
  Collapse,
} from '@material-ui/core'
import AdvancedConnectionSettings from './AdvancedConnectionSettings'

interface Props {
  actions: any
  classes: any
  connection?: ConnectionOptions
  visible: boolean
  showAdvancedSettings: boolean
}

class ConnectionSetup extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  public componentDidMount() {
    this.props.actions.loadConnectionSettings()
  }

  public render() {
    const { classes, visible } = this.props
    return (
      <div>
        <Modal open={visible} disableAutoFocus={true}>
          <Paper className={classes.root}>
            <div className={classes.left}><ProfileList /></div>
            <div className={classes.right}>
              <Toolbar>
                <Typography className={classes.title} variant="h6" color="inherit">MQTT Connection</Typography>
              </Toolbar>
              {this.renderSettings()}
            </div>
          </Paper>
        </Modal>
      </div>
    )
  }

  private renderSettings() {
    const { connection, showAdvancedSettings } = this.props
    if (!connection) {
      return null
    }

    return (
      <div>
        <Collapse in={!showAdvancedSettings}><ConnectionSettings connection={connection} /></Collapse>
        <Collapse in={showAdvancedSettings}><AdvancedConnectionSettings connection={connection} /></Collapse>
      </div>
    )
  }
}

const styles = (theme: Theme) => ({
  title: {
    color: theme.palette.text.primary,
  },
  root: {
    margin: '13vw 10vw 0 10vw',
    minWidth: '550px',
    height: '440px',
    outline: 'none' as 'none',
    display: 'flex' as 'flex',
  },
  left: {
    borderRightStyle: 'dotted' as 'dotted',
    borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
    paddingTop: `${2 * theme.spacing.unit}px`,
    flex: 3,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  right: {
    borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    backgroundColor: theme.palette.background.paper,
    padding: `${2 * theme.spacing.unit}px`,
    flex: 10,
  },
})

const mapStateToProps = (state: AppState) => {
  return {
    visible: !state.connection.connected,
    showAdvancedSettings: state.connectionManager.showAdvancedSettings,
    connection: state.connectionManager.selected ? state.connectionManager.connections[state.connectionManager.selected] : undefined,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(connectionManagerActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ConnectionSetup))
