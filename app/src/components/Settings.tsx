import * as React from 'react'
import * as q from '../../../backend/src/Model'

import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

import ChevronRight from '@material-ui/icons/ChevronRight'

import { Typography, InputBase, Input, InputLabel } from '@material-ui/core'
import { withStyles, StyleRulesCallback } from '@material-ui/core/styles'

import { settingsActions } from '../actions'
import { AppState, NodeOrder } from '../reducers'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const styles: StyleRulesCallback = theme => ({
  drawer: {
    backgroundColor: theme.palette.background.default,
    flexShrink: 0,
  },
  paper: {
    width: '300px',
  },
  title: {
    color: theme.palette.text.primary,
    paddingTop: `${theme.spacing.unit}px`,
    ...theme.mixins.toolbar,
  },
  input: {
    minWidth: '150px',
    margin: `auto ${theme.spacing.unit}px auto ${2 * theme.spacing.unit}px`,
  },
})

interface Props {
  actions?: any
  autoExpandLimit: number
  visible: boolean
  store?: any
  classes: any
  nodeOrder: NodeOrder
}

class Settings extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  public render() {
    const { classes, actions, visible } = this.props
    return (
      <Drawer
        anchor="left"
        className={classes.drawer}
        open={visible}
        variant="persistent"
      >
        <div
          className={classes.paper}
          tabIndex={0}
          role="button"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        >

          <Typography className={ classes.title } variant="h6" color="inherit">
            <IconButton onClick={actions.toggleSettingsVisibility}>
              <ChevronRight />
            </IconButton>
            Settings
          </Typography>
          <Divider />

          {this.renderAutoExpand()}
          {this.renderNodeOrder()}
        </div>
      </Drawer>
    )
  }

  private renderAutoExpand() {
    const { classes, actions, autoExpandLimit } = this.props

    return (
        <div style={{ padding: '8px' }}>
        <InputLabel htmlFor="auto-expand">Auto Expand</InputLabel>
        <Select
            value={autoExpandLimit}
            onChange={ (e: React.ChangeEvent<HTMLSelectElement>) => actions.setAutoExpandLimit(e.target.value) }
            input={<Input name="auto-expand" id="auto-expand-label-placeholder" />}
            displayEmpty={true}
            name="auto-expand"
            className={classes.input}
        >
          <MenuItem value={0}><em>Disabled</em></MenuItem>
          <MenuItem value={2}>Few</MenuItem>
          <MenuItem value={3}>Some</MenuItem>
          <MenuItem value={10}>Most</MenuItem>
          <MenuItem value={1E6}>All</MenuItem>
        </Select>
      </div>
    )
  }

  private renderNodeOrder() {
    const { classes, actions, nodeOrder } = this.props

    return (
      <div style={{ padding: '8px' }}>
      <InputLabel htmlFor="auto-expand">Topic order</InputLabel>
      <Select
          value={nodeOrder}
          onChange={ (e: React.ChangeEvent<HTMLSelectElement>) => {
            window.requestAnimationFrame(() => {
              actions.setNodeOrder(e.target.value)
            })
          }}
          input={<Input name="node-order" id="node-order-label-placeholder" />}
          displayEmpty={true}
          name="node-order"
          className={classes.input}
      >
        <MenuItem value={NodeOrder.none}><em>default</em></MenuItem>
        <MenuItem value={NodeOrder.abc}>a-z</MenuItem>
        <MenuItem value={NodeOrder.messages}>{NodeOrder.messages}</MenuItem>
        <MenuItem value={NodeOrder.topics}>{NodeOrder.topics}</MenuItem>
      </Select>
    </div>)
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    autoExpandLimit: state.settings.autoExpandLimit,
    nodeOrder: state.settings.nodeOrder,
    visible: state.settings.visible,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(settingsActions, dispatch),
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Settings))
