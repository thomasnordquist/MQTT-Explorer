import * as React from 'react'
import BooleanSwitch from './BooleanSwitch'
import BrokerStatistics from './BrokerStatistics'
import ChevronRight from '@mui/icons-material/ChevronRight'
import TimeLocale from './TimeLocale'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { globalActions, settingsActions } from '../../actions'
import { shell } from 'electron'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { TopicOrder } from '../../reducers/Settings'

import {
  Divider,
  Drawer,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Tooltip,
} from '@mui/material'

export const autoExpandLimitSet = [
  {
    limit: 0,
    name: 'Collapsed',
  },
  {
    limit: 2,
    name: 'Few',
  },
  {
    limit: 5,
    name: 'Some',
  },
  {
    limit: 15,
    name: 'Most',
  },
  {
    limit: 30,
    name: 'Most',
  },
  {
    limit: 1e6,
    name: 'All',
  },
]

const styles = (theme: Theme) => ({
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
})

interface Props {
  actions: {
    settings: typeof settingsActions
    global: typeof globalActions
  }
  autoExpandLimit: number
  classes: any
  highlightTopicUpdates: boolean
  selectTopicWithMouseOver: boolean
  store?: any
  topicOrder: TopicOrder
  visible: boolean
  theme: 'light' | 'dark'
}

class Settings extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  private openGithubPage = () => {
    shell.openExternal('https://github.com/thomasnordquist')
  }

  private renderHighlightTopicUpdates() {
    const { highlightTopicUpdates, actions } = this.props

    return (
      <BooleanSwitch
        title="Show Activity"
        tooltip="Topics blink when a new message arrives"
        value={highlightTopicUpdates}
        action={actions.settings.toggleHighlightTopicUpdates}
      />
    )
  }

  private selectTopicsOnMouseOver() {
    const { actions, selectTopicWithMouseOver } = this.props
    const toggle = () => actions.settings.selectTopicWithMouseOver(!selectTopicWithMouseOver)

    return (
      <BooleanSwitch
        title="Quick Preview"
        tooltip="Select topics on mouse over"
        value={selectTopicWithMouseOver}
        action={toggle}
      />
    )
  }

  private toggleTheme() {
    const { actions, theme } = this.props

    return (
      <BooleanSwitch
        title="Dark Mode"
        tooltip="Enable dark theme"
        value={theme === 'dark'}
        action={actions.settings.toggleTheme}
      />
    )
  }

  private renderAutoExpand() {
    const { classes, autoExpandLimit } = this.props

    const limits = autoExpandLimitSet.map(limit => (
      <MenuItem key={limit.limit} value={limit.limit}>
        {limit.limit < 10000 && limit.limit > 0 ? `≤ ${limit.limit} topics` : limit.name}
      </MenuItem>
    ))
    return (
      <div style={{ padding: '8px', display: 'flex' }}>
        <InputLabel htmlFor="auto-expand" style={{ flex: '1', marginTop: '8px' }}>
          Auto Expand
        </InputLabel>
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

  private onChangeAutoExpand = (e: React.ChangeEvent<{ value: unknown }>) => {
    this.props.actions.settings.setAutoExpandLimit(parseInt(String(e.target.value), 10))
  }

  private renderNodeOrder() {
    const { classes, topicOrder } = this.props

    return (
      <div style={{ padding: '8px', display: 'flex' }}>
        <InputLabel htmlFor="auto-expand" style={{ flex: '1', marginTop: '8px' }}>
          Topic Order
        </InputLabel>
        <Select
          value={topicOrder}
          onChange={this.onChangeSorting}
          input={<Input name="node-order" id="node-order-label-placeholder" />}
          displayEmpty={true}
          name="node-order"
          className={classes.input}
          style={{ flex: '1' }}
        >
          <MenuItem value={TopicOrder.none}>
            <em>default</em>
          </MenuItem>
          <MenuItem value={TopicOrder.abc}>a-z</MenuItem>
          <MenuItem value={TopicOrder.messages}>{TopicOrder.messages}</MenuItem>
          <MenuItem value={TopicOrder.topics}>{TopicOrder.topics}</MenuItem>
        </Select>
      </div>
    )
  }

  private onChangeSorting = (e: React.ChangeEvent<{ value: unknown }>) => {
    this.props.actions.settings.setTopicOrder(e.target.value as TopicOrder)
  }

  public render() {
    const { classes, actions, visible } = this.props
    return (
      <Drawer anchor="left" className={classes.drawer} open={visible} variant="persistent">
        <div className={classes.paper} tabIndex={0} role="button">
          <Typography className={classes.title} variant="h6" color="inherit">
            <IconButton onClick={actions.global.toggleSettingsVisibility}>
              <ChevronRight />
            </IconButton>
            Settings
          </Typography>
          <Divider style={{ userSelect: 'none' }} />
        </div>
        <div>
          {this.renderAutoExpand()}
          {this.renderNodeOrder()}
          <TimeLocale />
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
}

const mapStateToProps = (state: AppState) => {
  return {
    autoExpandLimit: state.settings.get('autoExpandLimit'),
    topicOrder: state.settings.get('topicOrder'),
    visible: state.globalState.get('settingsVisible'),
    highlightTopicUpdates: state.settings.get('highlightTopicUpdates'),
    selectTopicWithMouseOver: state.settings.get('selectTopicWithMouseOver'),
    theme: state.settings.get('theme'),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      settings: bindActionCreators(settingsActions, dispatch),
      global: bindActionCreators(globalActions, dispatch),
    },
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Settings))
