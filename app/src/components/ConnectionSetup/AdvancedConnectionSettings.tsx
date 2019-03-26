import * as React from 'react'
import Add from '@material-ui/icons/Add'
import Delete from '@material-ui/icons/Delete'
import Undo from '@material-ui/icons/Undo'
import Lock from '@material-ui/icons/Lock'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'

import {
  Button,
  Grid,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@material-ui/core'
import ClearAdornment from '../helper/ClearAdornment';

interface Props {
  connection: ConnectionOptions
  classes: any
  managerActions: typeof connectionManagerActions
}

interface State {
  subscription: string
}

class ConnectionSettings extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { subscription: '' }
  }

  private handleChange = (name: string) => (event: any) => {
    this.props.managerActions.updateConnection(this.props.connection.id, {
      [name]: event.target.value,
    })
  }

  public render() {
    const { classes } = this.props
    return (
      <div>
        <form className={classes.container} noValidate={true} autoComplete="off">
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={10} className={classes.gridPadding}>
              <TextField
                className={classes.fullWidth}
                label="Subscription"
                margin="normal"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.setState({ subscription: event.target.value })}
              />
            </Grid>
            <Grid item={true} xs={2} className={classes.gridPadding}>
              <Button
                className={classes.button}
                color="secondary"
                onClick={() => this.props.managerActions.addSubscription(this.state.subscription, this.props.connection.id)}
                variant="contained"
              >
                <Add /> Add
              </Button>
            </Grid>
            <Grid item={true} xs={12} style={{ padding: 0 }}>
              <List
                className={`${classes.topicList} advanced-connection-settings-topic-list`}
                component="nav"
              >
                <div className={classes.list}>
                  {this.renderSubscriptions()}
                </div>
              </List>
            </Grid>
            <Grid item={true} xs={7} className={classes.gridPadding}>
              <TextField
                className={classes.fullWidth}
                label="MQTT Client ID"
                margin="normal"
                value={this.props.connection.clientId}
                onChange={this.handleChange('clientId')}
              />
            </Grid>
            <Grid item={true} xs={3} className={classes.gridPadding}>
              <div>
                <Tooltip title="Select certificate to verify authenticity of a self-signed certificate" placement="top">
                  <Button
                    variant="contained"
                    className={classes.button}
                    onClick={() => this.props.managerActions.selectCertificate(this.props.connection.id)}
                  >
                    <Lock /> Certificate
                  </Button>
                </Tooltip>
                {this.renderCertificateInfo()}
              </div>
            </Grid>
            <Grid item={true} xs={2} className={classes.gridPadding}>
              <Button
                variant="contained"
                className={classes.button}
                onClick={this.props.managerActions.toggleAdvancedSettings}
              >
                <Undo /> Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    )
  }

  private renderCertificateInfo() {
    if (!this.props.connection.selfSignedCertificate) {
      return null
    }

    return (
      <span>
        <Tooltip title={this.props.connection.selfSignedCertificate.name}>
          <Typography className={this.props.classes.certificateName}>
            <ClearAdornment action={this.clearCertificate} value={this.props.connection.selfSignedCertificate.name} />
            {this.props.connection.selfSignedCertificate.name}
          </Typography>
      </Tooltip>
     </span>
    )
  }

  private clearCertificate = () => {
    this.props.managerActions.updateConnection(this.props.connection.id, {
      selfSignedCertificate: undefined,
    })
  }

  private renderSubscriptions() {
    const connection = this.props.connection
    return connection.subscriptions.map(subscription => (
      <Subscription
        deleteAction={() => this.props.managerActions.deleteSubscription(subscription, connection.id)}
        subscription={subscription}
        key={subscription}
      />
    ))
  }
}

const Subscription = (props: {
  subscription: string,
  deleteAction: any,
}) => {
  return (
    <ListItem style={{ padding: '0 0 0 8px' }}>
      <ListItemText>
        <IconButton onClick={props.deleteAction} style={{ padding: '6px' }}>
          <Delete />
        </IconButton>
        {props.subscription}</ListItemText>
    </ListItem>
  )
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    managerActions: bindActionCreators(connectionManagerActions, dispatch),
  }
}

const styles: StyleRulesCallback<string> = (theme: Theme) => {
  return {
    fullWidth: {
      width: '100%',
    },
    gridPadding: {
      padding: '0 12px !important',
    },
    topicList: {
      height: '180px',
      overflowY: 'scroll' as 'scroll',
      margin: '8px 16px',
      backgroundColor: theme.palette.background.default,
    },
    button: {
      marginTop: theme.spacing(3),
      float: 'right',
    },
    certificateName: {
      width: '100%',
      height: 'calc(1em + 4px)',
      overflow: 'hidden' as 'hidden',
      whiteSpace: 'nowrap' as 'nowrap',
      textOverflow: 'ellipsis' as 'ellipsis',
      color: theme.palette.text.hint,
    },
  }
}

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(ConnectionSettings))
