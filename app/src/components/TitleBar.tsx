import * as React from 'react'
import * as q from '../../../backend/src/Model'

import { AppBar, Button, IconButton, InputBase, Toolbar, Typography } from '@material-ui/core'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'

import CloudOff from '@material-ui/icons/CloudOff'
import Menu from '@material-ui/icons/Menu'
import Search from '@material-ui/icons/Search'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { settingsActions, connectionActions } from '../actions'
import { AppState } from '../reducers'

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
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
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
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
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
          <Typography className={classes.title} variant="h6" color="inherit">MQTT-Explorer</Typography>
          {this.renderSearch()}
          <Button style={{ margin: 'auto 8px auto auto' }} onClick={actions.connection.disconnect}>
            Disconnect <CloudOff style={{ marginRight: '8px', paddingLeft: '8px' }}/>
          </Button>
        </Toolbar>
      </AppBar>
    )
  }

  private renderSearch() {
    const { classes } = this.props

    return (
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <Search />
        </div>
        <InputBase
          value={this.props.topicFilter}
          onChange={this.onFilterChange}
          placeholder="Search…"
          classes={{ root: classes.inputRoot, input: classes.inputInput }}
        />
      </div>
    )
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
