import * as React from 'react'
import { useState, useCallback, memo } from 'react'
import Add from '@mui/icons-material/Add'
import Lock from '@mui/icons-material/Lock'
import Undo from '@mui/icons-material/Undo'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { Button, Grid, TextField, Tooltip } from '@mui/material'
import { QoS } from 'mqtt-explorer-backend/src/DataSource/MqttSource'
import { connectionManagerActions } from '../../actions'
import { QosSelect } from '../QosSelect'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import Subscriptions from './Subscriptions'

const SubscriptionsAny = Subscriptions as any

interface Props {
  connection: ConnectionOptions
  classes: any
  managerActions: typeof connectionManagerActions
}

const ConnectionSettings = memo((props: Props) => {
  const [qos, setQos] = useState<QoS>(0)
  const [topic, setTopic] = useState('')
  const { classes } = props

  const updateSubscription = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setTopic(event.target.value),
    []
  )

  const handleChange = useCallback(
    (name: string) => (event: any) => {
      props.managerActions.updateConnection(props.connection.id, {
        [name]: event.target.value,
      })
    },
    []
  )

  return (
    <div>
      <form className={classes.container} noValidate autoComplete="off">
        <Grid container spacing={3}>
          <Grid item xs={8} className={classes.gridPadding}>
            <TextField
              className={`${classes.fullWidth} advanced-connection-settings-topic-input`}
              label="Topic"
              placeholder="example/topic"
              margin="normal"
              value={topic}
              onChange={updateSubscription}
            />
          </Grid>
          <Grid item xs={2} className={classes.gridPadding}>
            <div className={classes.qos}>
              <QosSelect label="QoS" selected={qos} onChange={setQos} />
            </div>
          </Grid>
          <Grid item xs={2} className={classes.gridPadding}>
            <Button
              className={classes.button}
              color="secondary"
              onClick={() => props.managerActions.addSubscription({ topic, qos }, props.connection.id)}
              variant="contained"
              data-testid="add-subscription-button"
            >
              <Add /> Add
            </Button>
          </Grid>
          <Grid item xs={12} style={{ padding: 0 }}>
            <SubscriptionsAny connection={props.connection} />
          </Grid>
          <Grid item xs={7} className={classes.gridPadding}>
            <TextField
              className={classes.fullWidth}
              label="MQTT Client ID"
              margin="normal"
              value={props.connection.clientId}
              onChange={handleChange('clientId')}
            />
          </Grid>
          <Grid item xs={3} className={classes.gridPadding}>
            <div>
              <Tooltip title="Manage tls connection certificates" placement="top">
                <Button
                  variant="contained"
                  className={classes.button}
                  onClick={() => props.managerActions.toggleCertificateSettings()}
                >
                  <Lock /> Certificates
                </Button>
              </Tooltip>
            </div>
          </Grid>
          <Grid item xs={2} className={classes.gridPadding}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={props.managerActions.toggleAdvancedSettings}
              data-testid="back-button"
            >
              <Undo /> Back
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  )
})

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
    float: 'right' as const,
  },
  qos: {
    marginTop: theme.spacing(1),
  },
})

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(ConnectionSettings) as any)
