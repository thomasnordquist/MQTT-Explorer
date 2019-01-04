import * as React from 'react'

import { Typography, Toolbar, Modal, MenuItem, Button, Grid, Paper, TextField, Switch, FormControlLabel } from '@material-ui/core'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

interface Props {
  classes: {[s: string]: string}
  theme: Theme
  onAbort: () => void
}

const protocols = [
  'tcp://',
  'ws://',
]

interface State {
  visible: boolean
  name: string
  host: string
  protocol: string
  port: number
  ssl: boolean
  sslValidation: boolean
  clientId: string
  username: string
  password: string
}

class Connection extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      visible: true,
      name: '',
      host: '',
      protocol: protocols[0],
      port: 1883,
      ssl: false,
      sslValidation: true,
      clientId: '',
      username: '',
      password: '',
    }
  }

  public static styles: StyleRulesCallback<string> = (theme: Theme) => {
    return {
      root: {
        minWidth: 550,
        maxWidth: 650,
        backgroundColor: theme.palette.background.default,
        margin: '20vh auto auto auto',
        padding: `${2 * theme.spacing.unit}px`,
        outline: 'none',
      },
      title: {
        color: theme.palette.text.primary,
      },
      paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
      textField: {
        width: '100%',
      },
      switch: {
        marginTop: `${1 * theme.spacing.unit}px`,
      },
      button: {
        margin: theme.spacing.unit,
      },
    }
  }

  private handleChange = (name: string) => (event: any) => {
    const state: any = {
      [name]: event.target.value,
    }
    this.setState(state)
  }

  public render() {
    const { classes } = this.props
    return <Modal open={this.state.visible} disableAutoFocus={true} onClose={() => { console.log('close') }}>
        <Paper className={classes.root}>
          <Toolbar>
            <Typography className={classes.title} variant="h6" color="inherit">MQTT Connection</Typography>
          </Toolbar>
          <form className={classes.container} noValidate autoComplete="off">

            <Grid container spacing={24}>
              <Grid item xs={5}>
                <TextField
                  label="Name"
                  className={classes.textField}
                  value={this.state.name}
                  onChange={this.handleChange('name')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={3}>
                <div className={classes.switch}>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={this.state.sslValidation}
                        onChange={() => this.setState({ sslValidation: !this.state.sslValidation })}
                        color="primary"
                      />
                    )}
                    label="Validate certificate"
                    labelPlacement="bottom"
                  />
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className={classes.switch}>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={this.state.ssl}
                        onChange={() => this.setState({ ssl: !this.state.ssl })}
                        color="primary"
                      />
                    )}
                    label="Encryption"
                    labelPlacement="bottom"
                  />
                </div>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  select
                  label="Protocol"
                  className={classes.textField}
                  value={this.state.protocol}
                  onChange={this.handleChange('protocol')}
                  margin="normal"
                >
                  {protocols.map((value: string) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={7}>
                <TextField
                  label="Host"
                  className={classes.textField}
                  value={this.state.host}
                  onChange={this.handleChange('host')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Port"
                  className={classes.textField}
                  value={this.state.port}
                  onChange={this.handleChange('port')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Username"
                  className={classes.textField}
                  value={this.state.username}
                  onChange={this.handleChange('username')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Password"
                  type="type"
                  className={classes.textField}
                  value={this.state.password}
                  onChange={this.handleChange('password')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}></Grid>
            </Grid>
            <br />
            <div style={{ textAlign: 'right' }}>
              <Button variant="contained" className={classes.button}>
                Test Connection
              </Button>
              <Button variant="contained" color="secondary" className={classes.button} onClick={() => this.setState({ visible: false })}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" className={classes.button}>
                Save
              </Button>
            </div>
          </form>
        </Paper>
    </Modal>
  }
}

export default withStyles(Connection.styles, { withTheme: true })(Connection)
