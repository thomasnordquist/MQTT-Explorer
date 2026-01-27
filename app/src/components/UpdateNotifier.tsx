import { compareVersions } from 'compare-versions'
import electron from 'electron'
import React from 'react'
import axios from 'axios'
import Close from '@mui/icons-material/Close'
import CloudDownload from '@mui/icons-material/CloudDownload'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { green } from '@mui/material/colors'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { Button, IconButton, Modal, Paper, Snackbar, SnackbarContent, Typography } from '@mui/material'
import { updateNotifierActions } from '../actions'

import { AppState } from '../reducers'
import { rendererRpc, getAppVersion } from '../eventBus'

interface Props {
  showUpdateNotification: boolean
  showUpdateDetails: boolean
  classes: any
  actions: any
}

interface GithubRelease {
  url: string
  assets?: Array<GithubAsset>
  published_at: string // "2019-01-25T20:14:39Z"
  body_html: string
  body: string
  body_text: string
  tag_name: string
  prerelease: boolean
}

interface GithubAsset {
  id: number
  node_id: string
  url: string
  browser_download_url: string
  name: string
  label: string
}

interface State {
  newerVersions: Array<GithubRelease>
}

class UpdateNotifier extends React.PureComponent<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { newerVersions: [] }

    this.checkForUpdates()
  }

  private async checkForUpdates() {
    const ownVersion = await rendererRpc.call(getAppVersion, undefined, 10000)
    const releases = await this.fetchReleases()
    const newerVersions = releases
      .filter(release => this.allowPrereleaseIfOwnVersionIsBeta(release, ownVersion))
      .filter(release => compareVersions(release.tag_name, ownVersion) > 0)
      .sort((a, b) => compareVersions(b.tag_name, a.tag_name))

    if (newerVersions.length > 0) {
      this.setState({ newerVersions })
      this.props.actions.showUpdateNotification(true)
    }
  }

  private allowPrereleaseIfOwnVersionIsBeta(release: GithubRelease, ownVersion: string) {
    const ownVersionIsBeta = !/alpha|beta/.test(ownVersion)

    return ownVersionIsBeta || !release.prerelease
  }

  private async fetchReleases(): Promise<Array<GithubRelease>> {
    const res = await axios.get('https://api.github.com/repos/thomasnordquist/mqtt-explorer/releases', {
      headers: {
        accept: 'application/vnd.github.v3.full+json',
      },
    })

    return res.data as Array<GithubRelease>
  }

  private onCloseNotification = (event: any, reason: any) => {
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

  private renderUpdateNotification() {
    const snackbarAnchor: any = {
      vertical: 'top',
      horizontal: 'right',
    }

    return (
      <Snackbar
        anchorOrigin={snackbarAnchor}
        open={this.props.showUpdateNotification}
        autoHideDuration={12000}
        onClose={this.onCloseNotification}
      >
        <SnackbarContent
          className={this.props.classes.success}
          message={`${this.state.newerVersions.length} Update(s) available`}
          action={this.notificationActions()}
        />
      </Snackbar>
    )
  }

  private notificationActions() {
    return [
      <Button key="undo" size="small" onClick={this.showDetails}>
        Details
      </Button>,
      <IconButton
        key="close"
        aria-label="Close"
        color="inherit"
        className={this.props.classes.close}
        onClick={this.closeNotification}
      >
        <Close />
      </IconButton>,
    ]
  }

  private renderUpdateDetails() {
    const latestUpdate = this.state.newerVersions[0]
    if (!latestUpdate) {
      return null
    }
    const releaseNotes = this.state.newerVersions
      .map(release => `<p><h3>${release.tag_name}</h3><p/><p>${release.body_html}</p>`)
      .join('<hr />')

    return (
      <Modal open={this.props.showUpdateDetails} disableAutoFocus onClose={this.hideDetails}>
        <Paper className={this.props.classes.root}>
          <Typography variant="h6" className={this.props.classes.title}>
            Version {latestUpdate.tag_name}
          </Typography>
          <Typography className={this.props.classes.title}>Changelog</Typography>
          <div className={this.props.classes.releaseNotes} dangerouslySetInnerHTML={{ __html: releaseNotes }} />
          {this.renderDownloads()}
          <Button className={this.props.classes.download} onClick={this.openHomePage}>
            Github Page
          </Button>
          <Button className={this.props.classes.closeButton} color="secondary" onClick={this.hideDetails}>
            Close
          </Button>
        </Paper>
      </Modal>
    )
  }

  private openHomePage = () => {
    this.openUrl('https://mqtt-explorer.com')
  }

  private openUrl = (url: string) => {
    electron.shell.openExternal(url)
  }

  private assetForCurrentPlatform(asset: GithubAsset) {
    let regex: RegExp
    const platform = this.getPlatform()
    if (platform === 'darwin') {
      regex = /\.dmg$/
    } else if (platform === 'win32') {
      regex = /\.exe$/
    } else {
      regex = /\.AppImage$/
    }

    return regex.test(asset.name)
  }

  private getPlatform(): string {
    if (typeof window === 'undefined') return 'linux'
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (userAgent.includes('mac')) return 'darwin'
    if (userAgent.includes('win')) return 'win32'
    return 'linux'
  }

  private renderDownloads() {
    const latestUpdate = this.state.newerVersions[0]
    if (!latestUpdate || !latestUpdate.assets) {
      return null
    }

    return latestUpdate.assets.filter(this.assetForCurrentPlatform).map(asset => (
      <div>
        <Button className={this.props.classes.download} onClick={() => this.openUrl(asset.browser_download_url)}>
          <CloudDownload />
          &nbsp;
          {asset.name}
        </Button>
      </div>
    ))
  }

  public render() {
    return (
      <div>
        {this.renderUpdateNotification()}
        {this.renderUpdateDetails()}
      </div>
    )
  }
}

const styles = (theme: Theme) => ({
  success: {
    backgroundColor: green[600],
    color: theme.typography.button.color,
  },
  close: {
    padding: '4px',
  },
  root: {
    minWidth: '350px',
    maxWidth: '500px',
    backgroundColor: theme.palette.background.default,
    margin: '20vh auto auto auto',
    padding: theme.spacing(2),
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
    padding: theme.spacing(2),
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

const mapStateToProps = (state: AppState) => ({
  showUpdateNotification: state.globalState.get('showUpdateNotification'),
  showUpdateDetails: state.globalState.get('showUpdateDetails'),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(updateNotifierActions, dispatch),
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(UpdateNotifier))
