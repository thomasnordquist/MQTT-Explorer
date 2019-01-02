import * as React from "react";
import * as q from '../../../backend/src/Model'

import SearchIcon from '@material-ui/icons/Search';

import { AppBar, Toolbar, Typography, InputBase } from '@material-ui/core';
import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

const styles: StyleRulesCallback = (theme) => ({
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
  }
});

interface Props {
  classes: any
}

class TitleBar extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedNode: undefined
    }
  }

  public render() {
    const { classes } = this.props;

    return <AppBar position="static">
        <Toolbar>
          <Typography className={classes.title} variant="h6" color="inherit">MQTT-Xplorer</Typography>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
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

export default withStyles(styles)(TitleBar)
