import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import Clear from '@material-ui/icons/Clear'
import Code from '@material-ui/icons/Code'
import Copy from '../../helper/Copy'
import DateFormatter from '../../helper/DateFormatter'
import ExpandMore from '@material-ui/icons/ExpandMore'
import MessageHistory from './MessageHistory'
import Reorder from '@material-ui/icons/Reorder'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import ValueRenderer from './ValueRenderer'
import { AppState } from '../../../reducers'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { settingsActions, sidebarActions } from '../../../actions'
import { ValueRendererDisplayMode } from '../../../reducers/Settings'

import {
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Tooltip,
  Typography,
  StyleRulesCallback,
  withStyles,
  Theme,
} from '@material-ui/core'

interface Props {
  node?: q.TreeNode<any>
  valueRendererDisplayMode: ValueRendererDisplayMode
  sidebarActions: typeof sidebarActions
  settingsActions: typeof settingsActions
  classes: any
  lastUpdate: number
  compareMessage?: q.Message
}

interface State {}

class ValuePanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  private renderValue() {
    const node = this.props.node
    if (!node || !node.message) {
      return null
    }

    return (
      <ValueRenderer
        message={node.message}
        messageHistory={node.messageHistory}
        compareWith={this.props.compareMessage}
      />
    )
  }

  private renderViewOptions() {
    if (!this.props.node || !this.props.node.message || !this.props.node.mqttMessage) {
      return null
    }

    const retainedButton = (
      <Tooltip title="Delete retained topic" placement="top">
        <Button
          size="small"
          color="secondary"
          variant="contained"
          style={{ marginTop: '11px', padding: '0px 4px', minHeight: '24px' }}
          onClick={this.props.sidebarActions.clearRetainedTopic}
        >
          retained <Clear style={{ fontSize: '16px', marginLeft: '2px' }} />
        </Button>
      </Tooltip>
    )

    return (
      <div style={{ width: '100%', display: 'flex', paddingLeft: '8px' }}>
        <span style={{ marginTop: '2px', flexGrow: 1 }}>{this.renderActionButtons()}</span>
        <div style={{ flex: 6, textAlign: 'right' }}>{this.props.node.mqttMessage.retain ? retainedButton : null}</div>
        {this.messageMetaInfo()}
      </div>
    )
  }

  private messageMetaInfo() {
    if (!this.props.node || !this.props.node.message || !this.props.node.mqttMessage) {
      return null
    }

    return (
      <span style={{ width: '100%', paddingLeft: '8px', flex: 6 }}>
        <Typography style={{ textAlign: 'right' }}>QoS: {this.props.node.mqttMessage.qos}</Typography>
        <Typography style={{ textAlign: 'right' }}>
          <i>
            <DateFormatter date={this.props.node.message.received} />
          </i>
        </Typography>
      </span>
    )
  }

  private renderActionButtons() {
    const handleValue = (mouseEvent: React.MouseEvent, value: any) => {
      if (value === null) {
        return
      }
      this.props.settingsActions.setValueDisplayMode(value)
    }

    return (
      <ToggleButtonGroup
        id="valueRendererDisplayMode"
        value={this.props.valueRendererDisplayMode}
        exclusive={true}
        onChange={handleValue}
      >
        <ToggleButton className={this.props.classes.toggleButton} value="diff" id="valueRendererDisplayMode-diff">
          <Tooltip title="Show difference between the current and the last message">
            <span>
              <Code className={this.props.classes.toggleButtonIcon} />
            </span>
          </Tooltip>
        </ToggleButton>
        <ToggleButton className={this.props.classes.toggleButton} value="raw" id="valueRendererDisplayMode-raw">
          <Tooltip title="Raw value">
            <span>
              <Reorder className={this.props.classes.toggleButtonIcon} />
            </span>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    )
  }

  private panelStyle() {
    return {
      detailsStyle: { padding: '0px 16px 8px 8px', display: 'block' },
      summaryStyle: { minHeight: '0' },
    }
  }

  private handleMessageHistorySelect = (message: q.Message) => {
    if (message !== this.props.compareMessage) {
      this.props.sidebarActions.setCompareMessage(message)
    } else {
      this.props.sidebarActions.setCompareMessage(undefined)
    }
  }

  public render() {
    const { node, classes } = this.props
    const { detailsStyle, summaryStyle } = this.panelStyle()

    const copyValue =
      node && node.message && node.message.value ? (
        <Copy value={Base64Message.toUnicodeString(node.message.value)} />
      ) : null

    return (
      <ExpansionPanel key="value" defaultExpanded={true}>
        <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summaryStyle}>
          <Typography className={classes.heading}>Value {copyValue}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={detailsStyle}>
          {this.renderViewOptions()}
          <div>
            <React.Suspense fallback={<div>Loading...</div>}>{this.renderValue()}</React.Suspense>
          </div>
          <div>
            <MessageHistory
              onSelect={this.handleMessageHistorySelect}
              selected={this.props.compareMessage}
              node={this.props.node}
            />
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    sidebarActions: bindActionCreators(sidebarActions, dispatch),
    settingsActions: bindActionCreators(settingsActions, dispatch),
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    valueRendererDisplayMode: state.settings.get('valueRendererDisplayMode'),
    node: state.tree.get('selectedTopic'),
    compareMessage: state.sidebar.get('compareMessage'),
  }
}

const styles = (theme: Theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  toggleButton: {
    height: '36px',
  },
  toggleButtonIcon: {
    verticalAlign: 'middle',
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ValuePanel))
