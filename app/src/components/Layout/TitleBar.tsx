import * as React from 'react'
import CloudOff from '@mui/icons-material/CloudOff'
import Logout from '@mui/icons-material/Logout'
import Menu from '@mui/icons-material/Menu'
import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { connectionActions, globalActions, settingsActions } from '../../actions'
import { AppState } from '../../reducers'
import SearchBar from './SearchBar'
import PauseButton from './PauseButton'
import ConnectionHealthIndicator from '../helper/ConnectionHealthIndicator'
import { isBrowserMode } from '../../utils/browserMode'
import { useAuth } from '../../contexts/AuthContext'

const ConnectionHealthIndicatorAny = ConnectionHealthIndicator as any

const styles = (theme: Theme) => ({
  title: {
    display: 'none' as const,
    [theme.breakpoints.up(750)]: {
      display: 'block' as const,
    },
    [theme.breakpoints.up('md')]: {
      display: 'block' as const,
    },
    whiteSpace: 'nowrap' as const,
  },
  disconnectIcon: {
    [theme.breakpoints.down('xs')]: {
      display: 'none' as const,
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
    // Hide on mobile (<=768px)
    [theme.breakpoints.down('md')]: {
      display: 'none' as const,
    },
  },
  logout: {
    margin: 'auto 0 auto 8px',
    // Hide on mobile (<=768px)
    [theme.breakpoints.down('md')]: {
      display: 'none' as const,
    },
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

  private handleLogout = async () => {
    // Disconnect first
    this.props.actions.connection.disconnect()

    // Clear credentials from sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('mqtt-explorer-username')
      sessionStorage.removeItem('mqtt-explorer-password')
    }

    // Reload page to reset all state and show login dialog
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
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
            data-testid="disconnect-button"
          >
            Disconnect <CloudOff className={classes.disconnectIcon} />
          </Button>
          <LogoutButton classes={classes} onLogout={this.handleLogout} />
          <ConnectionHealthIndicatorAny withBackground />
        </Toolbar>
      </AppBar>
    )
  }
}

// Separate component to use hooks
function LogoutButton({ classes, onLogout }: { classes: any; onLogout: () => void }) {
  const { authDisabled } = useAuth()

  if (!isBrowserMode || authDisabled) {
    return null
  }

  return (
    <Button className={classes.logout} sx={{ color: 'primary.contrastText' }} onClick={onLogout}>
      Logout <Logout className={classes.disconnectIcon} />
    </Button>
  )
}

const mapStateToProps = (state: AppState) => ({
  topicFilter: state.settings.get('topicFilter'),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    settings: bindActionCreators(settingsActions, dispatch),
    global: bindActionCreators(globalActions, dispatch),
    connection: bindActionCreators(connectionActions, dispatch),
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TitleBar))
