import * as React from 'react'
import ClearAdornment from './helper/ClearAdornment'
import CloudOff from '@material-ui/icons/CloudOff'
import Menu from '@material-ui/icons/Menu'
import Search from '@material-ui/icons/Search'
import {
  AppBar,
  Button,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from '@material-ui/core'
import { AppState } from '../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectionActions, settingsActions } from '../actions'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'

const styles: StyleRulesCallback = theme => ({
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(8),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(10),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
})

interface Props {
  classes: any
  actions: {
    settings: typeof settingsActions,
    connection: typeof connectionActions,
  }
  topicFilter?: string
}

class TitleBar extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = { }
  }

  public render() {
    const { actions, classes } = this.props

    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={actions.settings.toggleSettingsVisibility}>
            <Menu />
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit">MQTT Explorer</Typography>
          {this.renderSearch()}
          <Button style={{ margin: 'auto 8px auto auto' }} onClick={actions.connection.disconnect}>
            Disconnect <CloudOff style={{ marginRight: '8px', paddingLeft: '8px' }}/>
          </Button>
        </Toolbar>
      </AppBar>
    )
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
          endAdornment={<div style={{ width: '24px', paddingRight: '8px' }}><ClearAdornment action={this.clearFilter} value={topicFilter} /></div>}
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
}

const mapStateToProps = (state: AppState) => {
  return {
    topicFilter: state.settings.topicFilter,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      settings: bindActionCreators(settingsActions, dispatch),
      connection: bindActionCreators(connectionActions, dispatch),
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TitleBar))
