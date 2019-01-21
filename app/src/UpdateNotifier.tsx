import * as React from 'react'

import {
   Button,
   IconButton,
   Modal,
   Paper,
   Snackbar,
   SnackbarContent,
   Typography,
} from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'
import { UpdateInfo, checkForUpdates, rendererEvents, updateAvailable } from '../../events'
import { green, red } from '@material-ui/core/colors'

import { AppState } from './reducers'
import Close from '@material-ui/icons/Close'
import CloudDownload from '@material-ui/icons/CloudDownload'
import { UpdateFileInfo } from 'builder-util-runtime'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { updateNotifierActions } from './actions'

interface Props {
  showUpdateNotification: boolean
  showUpdateDetails: boolean
  classes: any
  actions: any
}

class UpdateNotifier extends React.Component<Props, {}> {
  private updateInfo?: UpdateInfo
  constructor(props: any) {
    super(props)
    this.state = {
      selectedNode: undefined,
    }
  }

  public componentDidMount() {
    rendererEvents.emit(checkForUpdates, undefined)
    rendererEvents.subscribe(updateAvailable, this.handleUpdate)
  }

  public componentWillUnmount() {
    rendererEvents.unsubscribeAll(updateAvailable)
  }

  private fixUrl(url: string, version: string) {
    if (!/^http/.test(url)) {
      return `https://github.com/thomasnordquist/MQTT-Explorer/releases/download/v${version}/${url}`
    }

    return url
  }

  private handleUpdate = (updateInfo: UpdateInfo) => {
    this.updateInfo = updateInfo
    this.props.actions.showUpdateNotification(true)
  }

  private onCloseNotification = (event: React.SyntheticEvent<any>, reason: string) => {
    if (reason === 'clickaway') {
      return
    }
    this.props.actions.showUpdateNotification(false)
  }

  private closeNotification = () => {
    this.props.actions.showUpdateNotification(false)
  }

  private showDetails = () => {
    this.props.actions.showUpdateNotification(false)
    this.props.actions.showUpdateDetails(true)
  }

  private hideDetails = () => {
    this.props.actions.showUpdateDetails(false)
  }

  public render() {
    return (
      <div>
        {this.renderUpdateNotification()}
        {this.renderUpdateDetails()}
      </div>
    )
  }

  private renderUpdateNotification() {
    const snackbarAnchor: any = {
      vertical: 'top',
      horizontal: 'right',
    }

    return (
      <Snackbar
        anchorOrigin={snackbarAnchor}
        open={this.props.showUpdateNotification}
        autoHideDuration={7000}
        onClose={this.onCloseNotification}
      >
        <SnackbarContent
          className={this.props.classes.success}
          message="Update available"
          action={this.notificationActions()}
        />
      </Snackbar>
    )
  }

  private notificationActions() {
    return [(
        <Button key="undo" size="small" onClick={this.showDetails}>
          Download
        </Button>
      ), (
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={this.props.classes.close}
          onClick={this.closeNotification}
        >
          <Close />
        </IconButton>
      ),
    ]
  }

  private renderUpdateDetails() {
    if (!this.updateInfo) {
      return null
    }
    const releaseNotes = (this.updateInfo.releaseNotes as string) || ''
    return (
      <Modal
        open={this.props.showUpdateDetails}
        disableAutoFocus={true}
        onClose={this.hideDetails}
      >
        <Paper className={this.props.classes.root}>
          <Typography variant="h6" className={this.props.classes.title}>Version {this.updateInfo.version}</Typography>
          <Typography className={this.props.classes.title}>Changelog</Typography>
          <div className={this.props.classes.releaseNotes} dangerouslySetInnerHTML={{ __html: releaseNotes }} />
          {this.renderDownloads(this.updateInfo)}
          <Button className={this.props.classes.closeButton} color="secondary" onClick={this.hideDetails}>Close</Button>
        </Paper>
      </Modal>
    )
  }

  private urlToFilename(url: string) {
    const parts = url.split('/')

    return parts[parts.length - 1]
  }

  private renderDownloads(updateInfo: UpdateInfo) {
    console.log(updateInfo)
    return updateInfo.files
      .map((file: UpdateFileInfo, index: number) => (
        <div key={index}>
          <Button
            className={this.props.classes.download}
            href={this.fixUrl(file.url, updateInfo.version)}
          >
            <IconButton><CloudDownload /></IconButton>{this.urlToFilename(file.url)}
          </Button>
        </div>
      ))
  }
}

const styles = (theme: Theme) => ({
  success: {
    backgroundColor: green[600],
    color: theme.typography.button.color,
  },
  close: {
    padding: theme.spacing.unit / 2,
  },
  root: {
    minWidth: '350px',
    maxWidth: '500px',
    backgroundColor: theme.palette.background.default,
    margin: '20vh auto auto auto',
    padding: `${2 * theme.spacing.unit}px`,
    outline: 'none',
  },
  title: {
    color: theme.palette.text.primary,
  },
  releaseNotes: {
    overflow: 'auto scroll',
    color: theme.palette.text.secondary,
    backgroundColor: 'rgba(60, 60, 60, 0.6)',
    maxHeight: '28vh',
  },
  paper: {
    padding: `${theme.spacing.unit * 2}px`,
    color: theme.palette.text.secondary,
  },
  download: {
    width: '100%',
  },
  closeButton: {
    display: 'block',
    margin: '0 0 0 auto',
  },
})

const mapStateToProps = (state: AppState) => {
  return {
    showUpdateNotification: state.tooBigReducer.showUpdateNotification,
    showUpdateDetails: state.tooBigReducer.showUpdateDetails,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(updateNotifierActions, dispatch),
  }
}

export default withStyles(styles, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(UpdateNotifier))
