import * as React from 'react'
import CertificateFileSelection from './CertificateFileSelection'
import BrowserCertificateFileSelection from './BrowserCertificateFileSelection'
import Undo from '@material-ui/icons/Undo'
import { bindActionCreators } from 'redux'
import { Button, Grid } from '@material-ui/core'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import { Theme, withStyles } from '@material-ui/core/styles'

// Check if we're in browser mode
const isBrowserMode =
  typeof window !== 'undefined' && (typeof process === 'undefined' || process.env?.BROWSER_MODE === 'true')
const CertSelector = isBrowserMode ? BrowserCertificateFileSelection : CertificateFileSelection

interface Props {
  connection: ConnectionOptions
  classes: any
  managerActions: typeof connectionManagerActions
}

interface State {
  subscription: string
}

class Certificates extends React.PureComponent<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { subscription: '' }
  }

  private handleChange = (name: string) => (event: any) => {
    this.props.managerActions.updateConnection(this.props.connection.id, {
      [name]: event.target.value,
    })
  }

  private renderCertificateInfo() {
    if (!this.props.connection.selfSignedCertificate) {
      return null
    }

    return <span />
  }

  public render() {
    const { classes } = this.props
    return (
      <div>
        <form noValidate={true} autoComplete="off">
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={12} className={classes.gridPadding}>
              <CertSelector
                connection={this.props.connection}
                certificate={this.props.connection.selfSignedCertificate}
                title="Server Certificate (CA)"
                certificateType="selfSignedCertificate"
              />
            </Grid>
            <Grid item={true} xs={12} className={classes.gridPadding}>
              <CertSelector
                connection={this.props.connection}
                certificate={this.props.connection.clientCertificate}
                title="Client Certificate"
                certificateType="clientCertificate"
              />
            </Grid>
            <Grid item={true} xs={12} className={classes.gridPadding}>
              <CertSelector
                connection={this.props.connection}
                certificate={this.props.connection.clientKey}
                title="Client Key"
                certificateType="clientKey"
              />
            </Grid>
            <Grid item={true} xs={2} className={classes.gridPadding}>
              <br />
              <Button
                variant="contained"
                className={classes.button}
                onClick={this.props.managerActions.toggleCertificateSettings}
              >
                <Undo /> Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    managerActions: bindActionCreators(connectionManagerActions, dispatch),
  }
}

const styles = (theme: Theme) => ({
  fullWidth: {
    width: '100%',
  },
  gridPadding: {
    padding: '0 12px !important',
  },
  button: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(2),
  },
})

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(Certificates))
