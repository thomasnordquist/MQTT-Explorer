import * as React from 'react'
import Undo from '@mui/icons-material/Undo'
import { bindActionCreators, type Dispatch } from 'redux'
import { connect } from 'react-redux'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { MqttWill, QoS } from 'mqtt-explorer-backend/src/DataSource/MqttSource'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions, getWillPayloadError, getWillTopicError } from '../../model/ConnectionOptions'
import { QosSelect } from '../QosSelect'
import { ToggleSwitch } from './ToggleSwitch'

type Classes = { [name: string]: string }
type ManagerActions = typeof connectionManagerActions

interface Props {
  connection: ConnectionOptions
  classes: Classes
  managerActions: typeof connectionManagerActions
}

interface WillSettingsFormProps {
  classes: Classes
  will: MqttWill | undefined
  topicError: string | undefined
  payloadError: string | undefined
  onToggleEnabled: () => void
  onUpdateTopic: React.ChangeEventHandler<HTMLInputElement>
  onUpdatePayload: React.ChangeEventHandler<HTMLInputElement>
  onUpdateQos: (qos: QoS) => void
  onToggleRetain: () => void
  onBack: () => void
}

interface WillFieldsProps {
  classes: Classes
  will: MqttWill
  topicError: string | undefined
  payloadError: string | undefined
  onUpdateTopic: React.ChangeEventHandler<HTMLInputElement>
  onUpdatePayload: React.ChangeEventHandler<HTMLInputElement>
  onUpdateQos: (qos: QoS) => void
  onToggleRetain: () => void
}

interface WillTopicFieldProps {
  classes: Classes
  topic: string
  topicError: string | undefined
  onUpdateTopic: React.ChangeEventHandler<HTMLInputElement>
}

interface WillPayloadFieldProps {
  classes: Classes
  payload: string
  payloadError: string | undefined
  onUpdatePayload: React.ChangeEventHandler<HTMLInputElement>
}

const defaultWill: MqttWill = {
  topic: '',
  payload: '',
  qos: 0,
  retain: false,
}

const willHeader = (
  <Grid size={12}>
    <Typography variant="subtitle1">Last Will and Testament</Typography>
    <Typography variant="body2" color="textSecondary">
      The broker publishes this message when the connection ends unexpectedly.
    </Typography>
  </Grid>
)

function WillTopicField(props: WillTopicFieldProps) {
  const { classes, topic } = props
  const { topicError, onUpdateTopic } = props
  return (
    <Grid size={{ xs: 12, sm: 7 }}>
      <TextField
        className={classes.fullWidth}
        label="Topic"
        margin="normal"
        value={topic}
        onChange={onUpdateTopic}
        error={Boolean(topicError)}
        helperText={topicError || 'Publish topic; wildcards are not allowed'}
        required
        inputProps={{
          'data-testid': 'last-will-topic-input',
          'aria-label': 'Last Will topic',
        }}
      />
    </Grid>
  )
}

function WillPayloadField(props: WillPayloadFieldProps) {
  const { classes, payload } = props
  const { payloadError, onUpdatePayload } = props
  return (
    <Grid size={{ xs: 12, sm: 9 }}>
      <TextField
        className={classes.fullWidth}
        label="Payload"
        margin="normal"
        value={payload}
        onChange={onUpdatePayload}
        error={Boolean(payloadError)}
        helperText={payloadError}
        multiline
        minRows={2}
        inputProps={{
          'data-testid': 'last-will-payload-input',
          'aria-label': 'Last Will payload',
        }}
      />
    </Grid>
  )
}

function WillFields(props: WillFieldsProps) {
  const { classes, will } = props
  const { topicError, payloadError } = props
  const { onUpdateTopic, onUpdatePayload } = props
  const { onUpdateQos, onToggleRetain } = props
  return (
    <>
      <WillTopicField classes={classes} topic={will.topic} topicError={topicError} onUpdateTopic={onUpdateTopic} />
      <Grid size={{ xs: 12, sm: 2 }}>
        <div className={classes.qos}>
          <QosSelect label="QoS" selected={will.qos} onChange={onUpdateQos} />
        </div>
      </Grid>
      <WillPayloadField
        classes={classes}
        payload={will.payload}
        payloadError={payloadError}
        onUpdatePayload={onUpdatePayload}
      />
      <Grid size={{ xs: 12, sm: 3 }} className={classes.switchCell}>
        <ToggleSwitch label="Retain" classes={classes} value={will.retain} toggle={onToggleRetain} />
      </Grid>
    </>
  )
}

function WillBackButton(props: { classes: Classes; onBack: () => void }) {
  const { classes, onBack } = props
  return (
    <Grid size={12} className={classes.actionRow}>
      <Button
        variant="contained"
        startIcon={<Undo />}
        className={classes.button}
        onClick={onBack}
        data-testid="last-will-back-button"
      >
        Back
      </Button>
    </Grid>
  )
}

function WillSettingsForm(props: WillSettingsFormProps) {
  const { classes, will } = props
  const { topicError, payloadError } = props
  const { onToggleEnabled, onUpdateTopic } = props
  const { onUpdatePayload, onUpdateQos } = props
  const { onToggleRetain, onBack } = props
  return (
    <div>
      <form noValidate autoComplete="off">
        <Grid container columnSpacing={3} rowSpacing={2} className={classes.formGrid}>
          {willHeader}
          <Grid size={{ xs: 12, sm: 3 }} className={classes.switchCell}>
            <ToggleSwitch label="Enabled" classes={classes} value={Boolean(will)} toggle={onToggleEnabled} />
          </Grid>
          {will ? (
            <WillFields
              classes={classes}
              will={will}
              topicError={topicError}
              payloadError={payloadError}
              onUpdateTopic={onUpdateTopic}
              onUpdatePayload={onUpdatePayload}
              onUpdateQos={onUpdateQos}
              onToggleRetain={onToggleRetain}
            />
          ) : (
            <Grid size={{ xs: 12, sm: 9 }} className={classes.disabledMessage}>
              <Typography variant="body2" color="textSecondary">
                Enable Last Will to configure its topic, payload, QoS, and retain flag.
              </Typography>
            </Grid>
          )}
          <WillBackButton classes={classes} onBack={onBack} />
        </Grid>
      </form>
    </div>
  )
}

function createWillHandlers(connectionId: string, will: MqttWill | undefined, managerActions: ManagerActions) {
  function updateWill(changeSet: Partial<MqttWill>) {
    if (!will) return
    managerActions.updateConnection(connectionId, { will: { ...will, ...changeSet } })
  }

  return {
    toggleEnabled() {
      managerActions.updateConnection(connectionId, { will: will ? undefined : { ...defaultWill } })
    },
    updateTopic(event: React.ChangeEvent<HTMLInputElement>) {
      updateWill({ topic: event.target.value })
    },
    updatePayload(event: React.ChangeEvent<HTMLInputElement>) {
      updateWill({ payload: event.target.value })
    },
    updateQos(qos: QoS) {
      updateWill({ qos })
    },
    toggleRetain() {
      updateWill({ retain: !will?.retain })
    },
  }
}

function WillSettings(props: Props) {
  const { classes, connection, managerActions } = props
  const { id: connectionId, will } = connection
  const handlers = createWillHandlers(connectionId, will, managerActions)

  return (
    <WillSettingsForm
      classes={classes}
      will={will}
      topicError={getWillTopicError(will)}
      payloadError={getWillPayloadError(will)}
      onToggleEnabled={handlers.toggleEnabled}
      onUpdateTopic={handlers.updateTopic}
      onUpdatePayload={handlers.updatePayload}
      onUpdateQos={handlers.updateQos}
      onToggleRetain={handlers.toggleRetain}
      onBack={managerActions.toggleWillSettings}
    />
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  managerActions: bindActionCreators(connectionManagerActions, dispatch),
})

const styles = (theme: Theme) => ({
  formGrid: {
    boxSizing: 'border-box' as const,
    padding: theme.spacing(0, 1.5),
  },
  fullWidth: {
    width: '100%',
  },
  switchCell: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  },
  disabledMessage: {
    alignSelf: 'center' as const,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    marginTop: theme.spacing(1),
  },
  qos: {
    marginTop: theme.spacing(1),
  },
  switch: {
    marginTop: theme.spacing(1),
  },
})

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(WillSettings))
