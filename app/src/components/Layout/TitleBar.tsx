import * as React from 'react'
import CloudOff from '@mui/icons-material/CloudOff'
import ConnectionHealthIndicator from '../helper/ConnectionHealthIndicator'
const ConnectionHealthIndicatorAny = ConnectionHealthIndicator as any
import Menu from '@mui/icons-material/Menu'
import PauseButton from './PauseButton'
import SearchBar from './SearchBar'
import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionActions, globalActions, settingsActions } from '../../actions'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

const styles = (theme: Theme) => ({
  title: {
    display: 'none' as 'none',
    [theme.breakpoints.up(750)]: {
      display: 'block' as 'block',
    },
    whiteSpace: 'nowrap' as 'nowrap',
  },
  disconnectIcon: {
    [theme.breakpoints.down('xs')]: {
      display: 'none' as 'none',
    },
    marginRight: '8px',
    paddingLeft: '8px',
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  disconnect: {
    margin: 'auto 8px auto auto',
  },
  disconnectLabel: {
    color: theme.palette.primary.contrastText,
  },
})

interface Props {
  classes: any
  actions: {
    settings: typeof settingsActions
    connection: typeof connectionActions
    global: typeof globalActions
  }
  topicFilter?: string
}

class TitleBar extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  public render() {
    const { actions, classes } = this.props

    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={actions.global.toggleSettingsVisibility}
          >
            <Menu />
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit">
            MQTT Explorer
          </Typography>
          <SearchBar />
          <PauseButton />
          <Button
            className={classes.disconnect}
            sx={{ color: 'primary.contrastText' }}
            onClick={actions.connection.disconnect}
          >
            Disconnect <CloudOff className={classes.disconnectIcon} />
          </Button>
          <ConnectionHealthIndicatorAny withBackground={true} />
        </Toolbar>
      </AppBar>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    topicFilter: state.settings.get('topicFilter'),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      settings: bindActionCreators(settingsActions, dispatch),
      global: bindActionCreators(globalActions, dispatch),
      connection: bindActionCreators(connectionActions, dispatch),
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TitleBar))
