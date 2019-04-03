import * as React from 'react'
import BrokerStatistics from './BrokerStatistics'
import ChevronRight from '@material-ui/icons/ChevronRight'
import { AppState } from '../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { settingsActions } from '../actions'
import { shell } from 'electron'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'
import { TopicOrder } from '../reducers/Settings'

import {
  Divider,
  Drawer,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Switch,
  Tooltip,
} from '@material-ui/core'
const sha1 = require('sha1')

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
    userSelect: 'none' as 'none',
  },
  paper: {
    width: '300px',
  },
  title: {
    color: theme.palette.text.primary,
    paddingTop: theme.spacing(1),
    ...theme.mixins.toolbar,
  },
  input: {
    minWidth: '150px',
    margin: `auto ${theme.spacing(1)} auto ${theme.spacing(2)}px`,
  },
  author: {
    margin: 'auto 8px 8px auto',
    color: theme.palette.text.hint,
    cursor: 'pointer' as 'pointer',
  },
  switchBase: {
    height: theme.spacing(4),
  },
})

interface Props {
  actions: typeof settingsActions
  autoExpandLimit: number
  classes: any
  highlightTopicUpdates: boolean
  selectTopicWithMouseOver: boolean
  store?: any
  topicOrder: TopicOrder
  visible: boolean
  theme: 'light' | 'dark'
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
          {this.renderHighlightTopicUpdates()}
          {this.selectTopicsOnMouseOver()}
          {this.toggleTheme()}
        </div>
        <Tooltip placement="top" title="App Author">
          <Typography className={classes.author} onClick={this.openGithubPage}>
            by Thomas Nordquist
          </Typography>
        </Tooltip>
        <BrokerStatistics />
      </Drawer>
    )
  }

  private openGithubPage = () => {
    shell.openExternal('https://github.com/thomasnordquist')
  }

  private renderHighlightTopicUpdates() {
    const { highlightTopicUpdates, actions } = this.props

    return this.renderSwitch('Show Activity', highlightTopicUpdates, actions.toggleHighlightTopicUpdates, 'Topics blink when a new message arrives')
  }

  private renderSwitch(title: string, checked: boolean, action: any, tooltip: string) {
    const { classes } = this.props

    const clickHandler = (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      action()
    }

    return (
      <div style={{ padding: '8px', display: 'flex' }}>
        <Tooltip title={tooltip}>
          <InputLabel
            htmlFor={`toggle-${sha1(title)}`}
            onClick={clickHandler}
            style={{ flex: '1', paddingTop: '8px' }}
          >
            {title}
          </InputLabel>
        </Tooltip>
        <Tooltip title={tooltip}>
          <Switch
            name={`toggle-${sha1(title)}`}
            checked={checked}
            onChange={action}
            color="primary"
            classes={{ switchBase: classes.switchBase }}
          />
        </Tooltip>
      </div>
    )
  }

  private selectTopicsOnMouseOver() {
    const { actions, selectTopicWithMouseOver } = this.props
    const toggle = () => actions.selectTopicWithMouseOver(!selectTopicWithMouseOver)

    return this.renderSwitch('Quick Preview', selectTopicWithMouseOver, toggle, 'Select topics on mouse over')
  }

  private toggleTheme() {
    const { actions, theme } = this.props

    return this.renderSwitch('Theme', theme === 'light', actions.toggleTheme, 'Select a theme')
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
        <InputLabel htmlFor="auto-expand" style={{ flex: '1', marginTop: '8px' }}>Topic Order</InputLabel>
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
    highlightTopicUpdates: state.settings.highlightTopicUpdates,
    selectTopicWithMouseOver: state.settings.selectTopicWithMouseOver,
    theme: state.settings.theme,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(settingsActions, dispatch),
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Settings))
