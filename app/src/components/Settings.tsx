import * as React from 'react'

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
import { settingsActions, treeActions } from '../actions'
import { TopicOrder } from '../reducers/Settings'
import BrokerStatistics from './BrokerStatistics'

export const autoExpandLimitSet = [{
  limit: 0,
  name: 'Collapsed',
}, {
  limit: 2,
  name: 'Few',
}, {
  limit: 3,
  name: 'Some',
}, {
  limit: 10,
  name: 'Most',
}, {
  limit: 1E6,
  name: 'All',
}]

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
  autoExpandLimit: number
  visible: boolean
  store?: any
  topicOrder: TopicOrder
  classes: any
  actions: typeof settingsActions
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
        <BrokerStatistics />
      </Drawer>
    )
  }

  private renderAutoExpand() {
    const { classes, autoExpandLimit } = this.props

    const limits = autoExpandLimitSet.map(limit => <MenuItem key={limit.limit} value={limit.limit}>{limit.name}</MenuItem>)
    return (
      <div style={{ padding: '8px', display: 'flex' }}>
        <InputLabel htmlFor="auto-expand" style={{ flex: '1', marginTop: '8px' }}>Auto Expand</InputLabel>
        <Select
            value={autoExpandLimit}
            onChange={this.onChangeAutoExpand}
            input={<Input name="auto-expand" id="auto-expand-label-placeholder" />}
            name="auto-expand"
            className={classes.input}
            style={{ flex: '1' }}
        >
          {limits}
        </Select>
      </div>
    )
  }

  private onChangeAutoExpand = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.actions.setAutoExpandLimit(parseInt(e.target.value, 10))
  }

  private renderNodeOrder() {
    const { classes, topicOrder } = this.props

    return (
      <div style={{ padding: '8px', display: 'flex' }}>
        <InputLabel htmlFor="auto-expand" style={{ flex: '1', marginTop: '8px' }}>Topic order</InputLabel>
        <Select
          value={topicOrder}
          onChange={this.onChangeSorting}
          input={<Input name="node-order" id="node-order-label-placeholder" />}
          displayEmpty={true}
          name="node-order"
          className={classes.input}
          style={{ flex: '1' }}
        >
          <MenuItem value={TopicOrder.none}><em>default</em></MenuItem>
          <MenuItem value={TopicOrder.abc}>a-z</MenuItem>
          <MenuItem value={TopicOrder.messages}>{TopicOrder.messages}</MenuItem>
          <MenuItem value={TopicOrder.topics}>{TopicOrder.topics}</MenuItem>
        </Select>
    </div>)
  }

  private onChangeSorting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.actions.setTopicOrder(e.target.value as TopicOrder)
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
