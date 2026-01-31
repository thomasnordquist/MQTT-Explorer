import * as React from 'react'
import Undo from '@mui/icons-material/Undo'
import { bindActionCreators } from 'redux'
import { Button, Grid } from '@mui/material'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import BrowserCertificateFileSelection from './BrowserCertificateFileSelection'
import CertificateFileSelection from './CertificateFileSelection'
import { isBrowserMode } from '../../utils/browserMode'

// Use browser or desktop file selection based on mode
const CertSelector: any = isBrowserMode ? BrowserCertificateFileSelection : CertificateFileSelection

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
        <form noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} className={classes.gridPadding}>
              <CertSelector
                connection={this.props.connection}
                certificate={this.props.connection.selfSignedCertificate}
                title="Server Certificate (CA)"
                certificateType="selfSignedCertificate"
              />
            </Grid>
            <Grid item xs={12} className={classes.gridPadding}>
              <CertSelector
                connection={this.props.connection}
                certificate={this.props.connection.clientCertificate}
                title="Client Certificate"
                certificateType="clientCertificate"
              />
            </Grid>
            <Grid item xs={12} className={classes.gridPadding}>
              <CertSelector
                connection={this.props.connection}
                certificate={this.props.connection.clientKey}
                title="Client Key"
                certificateType="clientKey"
              />
            </Grid>
            <Grid item xs={2} className={classes.gridPadding}>
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

const mapDispatchToProps = (dispatch: any) => ({
  managerActions: bindActionCreators(connectionManagerActions, dispatch),
})

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

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(Certificates) as any)
