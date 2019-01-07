import * as React from 'react'
import * as q from '../../../backend/src/Model'

import Search from '@material-ui/icons/Search'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/icons/Menu'

import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Slider from '@material-ui/lab/Slider'

import { settingsActions } from '../actions'
import { AppState, SettingsModel } from '../reducers'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { AppBar, Toolbar, Typography, InputBase } from '@material-ui/core'
import { withStyles, StyleRulesCallback } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'

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
  actions: any
}

interface State {
  selectedNode?: q.TreeNode
  settingsVisible: boolean
  autoExpandLimit: number
}

class TitleBar extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      selectedNode: undefined,
      settingsVisible: false,
      autoExpandLimit: 0,
    }
  }

  public render() {
    const { classes } = this.props

    return <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={this.props.actions.toggleSettingsVisibility}>
            <Menu />
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit">MQTT-Xplorer</Typography>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <Search />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
            />
          </div>
        </Toolbar>
      </AppBar>
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(settingsActions, dispatch),
  }
}

export default withStyles(styles)(connect(null, mapDispatchToProps)(TitleBar))
