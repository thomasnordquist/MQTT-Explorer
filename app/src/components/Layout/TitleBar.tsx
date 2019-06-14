import * as React from 'react'
import ClearAdornment from '../helper/ClearAdornment'
import CloudOff from '@material-ui/icons/CloudOff'
import ConnectionHealthIndicator from '../helper/ConnectionHealthIndicator'
import Menu from '@material-ui/icons/Menu'
import PauseButton from './PauseButton'
import Search from '@material-ui/icons/Search'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionActions, globalActions, settingsActions } from '../../actions'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { Theme, withStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Button,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from '@material-ui/core'

const styles = (theme: Theme) => ({
  title: {
    display: 'none' as 'none',
    [theme.breakpoints.up(750)]: {
      display: 'block' as 'block',
    },
    whiteSpace: 'nowrap' as 'nowrap',
  },
  search: {
    position: 'relative' as 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    flexGrow: 1,
    maxWidth: '60%',

    [theme.breakpoints.up('md')]: {
      maxWidth: '30%',

      marginLeft: theme.spacing(4),
      width: 'auto' as 'auto',
    },
    [theme.breakpoints.up(750)]: {
      marginLeft: theme.spacing(4),
      width: 'auto' as 'auto',
    },
  },
  disconnectIcon: {
    [theme.breakpoints.down('xs')]: {
      display: 'none' as 'none',
    },
    marginRight: '8px',
    paddingLeft: '8px',
  },
  searchIcon: {
    width: theme.spacing(6),
    height: '100%',
    position: 'absolute' as 'absolute',
    pointerEvents: 'none' as 'none',
    display: 'flex' as 'flex',
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
  },
  inputRoot: {
    color: 'inherit' as 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(6),
    transition: theme.transitions.create('width'),
    width: '100%',
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  disconnect: {
    margin: 'auto 8px auto auto',
    color: theme.palette.primary.contrastText,
  },
})

interface Props {
  classes: any
  actions: {
    settings: typeof settingsActions,
    connection: typeof connectionActions,
    global: typeof globalActions,
  }
  topicFilter?: string
}

class TitleBar extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = { }
  }

  private renderSearch() {
    const { classes, topicFilter } = this.props

    return (
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <Search />
        </div>
        <InputBase
          value={topicFilter}
          onChange={this.onFilterChange}
          placeholder="Search…"
          endAdornment={<div style={{ width: '24px', paddingRight: '8px' }}><ClearAdornment variant="primary" action={this.clearFilter} value={topicFilter} /></div>}
          classes={{ root: classes.inputRoot, input: classes.inputInput }}
        />
      </div>
    )
  }

  private clearFilter = () => {
    this.props.actions.settings.filterTopics('')
  }

  private onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.actions.settings.filterTopics(event.target.value)
  }

  public render() {
    const { actions, classes } = this.props

    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={actions.global.toggleSettingsVisibility}>
            <Menu />
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit">MQTT Explorer</Typography>
          {this.renderSearch()}
          <PauseButton />
          <Button className={classes.disconnect} onClick={actions.connection.disconnect}>
            Disconnect <CloudOff className={classes.disconnectIcon} />
          </Button>
          <ConnectionHealthIndicator withBackground={true} />
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
