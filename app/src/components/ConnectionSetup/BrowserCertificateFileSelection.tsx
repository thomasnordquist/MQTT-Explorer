import * as React from 'react'
import Lock from '@mui/icons-material/Lock'
import { bindActionCreators } from 'redux'
import { Button, Theme, Tooltip, Typography } from '@mui/material'
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'
import { RpcEvents } from '../../../../events/EventsV2'
import { CertificateParameters, ConnectionOptions } from '../../model/ConnectionOptions'
import { CertificateTypes } from '../../actions/ConnectionManager'
import { connectionManagerActions } from '../../actions'
import ClearAdornment from '../helper/ClearAdornment'
import { rendererRpc } from '../../eventBus'

function BrowserCertificateFileSelection(props: {
  certificateType: CertificateTypes
  title: string
  certificate?: CertificateParameters
  classes: any
  actions: {
    connectionManager: typeof connectionManagerActions
  }
  connection: ConnectionOptions
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const clearCertificate = React.useCallback(() => {
    props.actions.connectionManager.updateConnection(props.connection.id, {
      [props.certificateType]: undefined,
    })
  }, [props.connection, props.certificateType])

  const handleFileSelect = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      try {
        // Read file content
        const reader = new FileReader()
        reader.onload = async e => {
          const content = e.target?.result
          if (typeof content === 'string') {
            // Convert to base64
            const base64Data = content.split(',')[1] || content

            // Upload via IPC instead of HTTP POST
            const result = await rendererRpc.call(RpcEvents.uploadCertificate, {
              filename: file.name,
              data: base64Data,
            })

            // Create certificate parameters
            const certificate: CertificateParameters = {
              name: result.name,
              data: result.data,
            }

            // Update connection
            props.actions.connectionManager.updateConnection(props.connection.id, {
              [props.certificateType]: certificate,
            })
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error uploading certificate:', error)
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [props.connection.id, props.certificateType, props.actions.connectionManager]
  )

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pem,.crt,.cer,.key"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <Tooltip title="Select certificate" placement="top">
        <Button variant="contained" className={props.classes.button} onClick={handleButtonClick}>
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

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    connectionManager: bindActionCreators(connectionManagerActions, dispatch),
  },
})

const styles = (theme: Theme) => ({
  certificateName: {
    width: '100%',
    height: 'calc(1em + 4px)',
    overflow: 'hidden' as const,
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis' as const,
    color: theme.palette.text.secondary,
  },
  button: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(2),
  },
})

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(BrowserCertificateFileSelection) as any)
