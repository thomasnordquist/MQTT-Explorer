import * as React from 'react'
import * as q from '../../../backend/src/Model'

import { AppState } from '../reducers'
import {
  Divider,
  Drawer,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'

import ChevronRight from '@material-ui/icons/ChevronRight'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { settingsActions } from '../actions'
import { TopicOrder } from '../reducers/Settings'

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
  topicOrder: TopicOrder
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
        >

          <Typography className={classes.title} variant="h6" color="inherit">
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
    const { classes, autoExpandLimit } = this.props
    return (
        <div style={{ padding: '8px' }}>
        <InputLabel htmlFor="auto-expand">Auto Expand</InputLabel>
        <Select
            value={autoExpandLimit}
            onChange={this.onChangeAutoExpand}
            input={<Input name="auto-expand" id="auto-expand-label-placeholder" />}
            name="auto-expand"
            className={classes.input}
        >
          <MenuItem value={0}><em>Collapsed</em></MenuItem>
          <MenuItem value={2}>Few</MenuItem>
          <MenuItem value={3}>Some</MenuItem>
          <MenuItem value={10}>Most</MenuItem>
          <MenuItem value={1E6}>All</MenuItem>
        </Select>
      </div>
    )
  }

  private onChangeAutoExpand = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.actions.setAutoExpandLimit(e.target.value)
  }

  private renderNodeOrder() {
    const { classes, topicOrder } = this.props

    return (
      <div style={{ padding: '8px' }}>
      <InputLabel htmlFor="auto-expand">Topic order</InputLabel>
      <Select
          value={topicOrder}
          onChange={this.onChangeSorting}
          input={<Input name="node-order" id="node-order-label-placeholder" />}
          displayEmpty={true}
          name="node-order"
          className={classes.input}
      >
        <MenuItem value={TopicOrder.none}><em>default</em></MenuItem>
        <MenuItem value={TopicOrder.abc}>a-z</MenuItem>
        <MenuItem value={TopicOrder.messages}>{TopicOrder.messages}</MenuItem>
        <MenuItem value={TopicOrder.topics}>{TopicOrder.topics}</MenuItem>
      </Select>
    </div>)
  }

  private onChangeSorting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.actions.setNodeOrder(e.target.value)
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    autoExpandLimit: state.settings.autoExpandLimit,
    topicOrder: state.settings.topicOrder,
    visible: state.settings.visible,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(settingsActions, dispatch),
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Settings))
