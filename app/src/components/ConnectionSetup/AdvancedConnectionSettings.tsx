import * as React from 'react'
import { useState, useCallback, memo } from 'react'
import Add from '@material-ui/icons/Add'
import Lock from '@material-ui/icons/Lock'
import Undo from '@material-ui/icons/Undo'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import { Theme, withStyles } from '@material-ui/core/styles'
import { Button, Grid, TextField, Tooltip } from '@material-ui/core'
import { QosSelect } from '../QosSelect'
import { QoS } from '../../../../backend/src/DataSource/MqttSource'
import Subscriptions from './Subscriptions'

interface Props {
  connection: ConnectionOptions
  classes: any
  managerActions: typeof connectionManagerActions
}

const ConnectionSettings = memo(function ConnectionSettings(props: Props) {
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
      <form className={classes.container} noValidate={true} autoComplete="off">
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={8} className={classes.gridPadding}>
            <TextField
              className={`${classes.fullWidth} advanced-connection-settings-topic-input`}
              label="Topic"
              placeholder="example/topic"
              margin="normal"
              value={topic}
              onChange={updateSubscription}
            />
          </Grid>
          <Grid item={true} xs={2} className={classes.gridPadding}>
            <div className={classes.qos}>
              <QosSelect label="QoS" selected={qos} onChange={setQos} />
            </div>
          </Grid>
          <Grid item={true} xs={2} className={classes.gridPadding}>
            <Button
              className={classes.button}
              color="secondary"
              onClick={() => {
                const trimmedTopic = topic.trim();
                if (trimmedTopic !== "") {
                  props.managerActions.addSubscription({ topic: trimmedTopic, qos }, props.connection.id);
                }
              }}
              variant="contained"
              disabled={topic.trim() === ""}
            >
              <Add /> Add
            </Button>
          </Grid>
          <Grid item={true} xs={12} style={{ padding: 0 }}>
            <Subscriptions connection={props.connection} />
          </Grid>
          <Grid item={true} xs={7} className={classes.gridPadding}>
            <TextField
              className={classes.fullWidth}
              label="MQTT Client ID"
              margin="normal"
              value={props.connection.clientId}
              onChange={handleChange('clientId')}
            />
          </Grid>
          <Grid item={true} xs={3} className={classes.gridPadding}>
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
          <Grid item={true} xs={2} className={classes.gridPadding}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={props.managerActions.toggleAdvancedSettings}
            >
              <Undo /> Back
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  )
})

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
    float: 'right' as 'right',
  },
  qos: {
    marginTop: theme.spacing(1),
  },
})

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(ConnectionSettings))
