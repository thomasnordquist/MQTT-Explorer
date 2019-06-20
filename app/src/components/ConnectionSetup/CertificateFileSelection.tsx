import * as React from 'react'
import Add from '@material-ui/icons/Add'
import ClearAdornment from '../helper/ClearAdornment'
import Delete from '@material-ui/icons/Delete'
import Lock from '@material-ui/icons/Lock'
import { bindActionCreators } from 'redux'
import { Button, Theme, Tooltip, Typography } from '@material-ui/core'
import { CertificateParameters, ConnectionOptions } from '../../model/ConnectionOptions'
import { CertificateTypes } from '../../actions/ConnectionManager'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { withStyles } from '@material-ui/styles'

function CertificateFileSelection(props: {
  certificateType: CertificateTypes
  title: string
  certificate?: CertificateParameters
  classes: any
  actions: {
    connectionManager: typeof connectionManagerActions
  }
  connection: ConnectionOptions
}) {
  const clearCertificate = React.useCallback(() => {
    props.actions.connectionManager.updateConnection(props.connection.id, {
      [props.certificateType]: undefined,
    })
  }, [props.connection, props.certificateType])

  return (
    <span>
      <Tooltip title="Select certificate" placement="top">
        <Button
          variant="contained"
          className={props.classes.button}
          onClick={() => props.actions.connectionManager.selectCertificate(props.certificateType, props.connection.id)}
        >
          <Lock /> {props.title}
        </Button>
      </Tooltip>
      <ClearCertificate classes={props.classes} certificate={props.certificate} action={clearCertificate} />
    </span>
  )
}

function ClearCertificate(props: { classes: any; certificate?: CertificateParameters; action: () => void }) {
  if (!props.certificate) {
    return null
  }

  return (
    <Tooltip title={props.certificate.name}>
      <Typography className={props.classes.certificateName}>
        <ClearAdornment action={props.action} value={props.certificate.name} />
        {props.certificate.name}
      </Typography>
    </Tooltip>
  )
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      connectionManager: bindActionCreators(connectionManagerActions, dispatch),
    },
  }
}

const styles = (theme: Theme) => ({
  certificateName: {
    width: '100%',
    height: 'calc(1em + 4px)',
    overflow: 'hidden' as 'hidden',
    whiteSpace: 'nowrap' as 'nowrap',
    textOverflow: 'ellipsis' as 'ellipsis',
    color: theme.palette.text.hint,
  },
  button: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(2),
  },
})

export default connect(
  undefined,
  mapDispatchToProps
)(withStyles(styles)(CertificateFileSelection))
