import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import Clear from '@material-ui/icons/Clear'
import Code from '@material-ui/icons/Code'
import Copy from '../../Copy'
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
}

interface State {
  compareMessage?: q.Message
}

class ValuePanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { }
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
        compareWith={this.state.compareMessage}
      />
    )
  }

  private messageMetaInfo() {
    if (!this.props.node || !this.props.node.message || !this.props.node.mqttMessage) {
      return null
    }

    const retainedButton = (
      <Tooltip title="Delete retained topic" placement="top">
        <Button
          size="small"
          color="secondary"
          variant="contained"
          style={{ marginTop: '-3px', padding: '0px 4px', minHeight: '24px' }}
          onClick={this.props.sidebarActions.clearRetainedTopic}
        >
          retained <Clear style={{ fontSize: '16px', marginLeft: '2px' }} />
        </Button>
      </Tooltip>
    )

    return (
      <div style={{ width: '100%', display: 'flex', paddingLeft: '8px' }}>
        <div style={{ flex: 6 }}><Typography>QoS: {this.props.node.mqttMessage.qos}</Typography></div>
        <span style={{ marginTop: '-8px' }}>{this.renderActionButtons()}</span>
        <div style={{ flex: 8, textAlign: 'center' }}>
          {this.props.node.mqttMessage.retain ? retainedButton : null}
        </div>
        <div style={{ flex: 8, textAlign: 'right' }}><Typography><i><DateFormatter date={this.props.node.message.received} /></i></Typography></div>
      </div>
    )
  }

  private renderActionButtons() {
    const handleValue = (_e: React.MouseEvent, value: any) => {
      this.props.settingsActions.setValueDisplayMode(value)
    }

    return (
      <ToggleButtonGroup id="valueRendererDisplayMode" value={this.props.valueRendererDisplayMode} exclusive={true} onChange={handleValue}>
        <ToggleButton value="diff" id="valueRendererDisplayMode-diff">
          <Tooltip title="Show difference between the current and the last message">
            <Code />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="raw" id="valueRendererDisplayMode-raw">
          <Tooltip title="Raw value">
            <Reorder />
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
    if (message !== this.state.compareMessage) {
      this.setState({ compareMessage: message })
    } else {
      this.setState({ compareMessage: undefined })
    }
  }

  public render() {
    const { node, classes } = this.props
    const { detailsStyle, summaryStyle } = this.panelStyle()

    const copyValue = (node && node.message && node.message.value) ? <Copy value={Base64Message.toUnicodeString(node.message.value)} /> : null

    return (
      <ExpansionPanel key="value" defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summaryStyle}>
            <Typography className={classes.heading}>Value {copyValue}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={detailsStyle}>
            {this.messageMetaInfo()}
            <div>
              <React.Suspense fallback={<div>Loading...</div>}>
                {this.renderValue()}
              </React.Suspense>
            </div>
            <div><MessageHistory onSelect={this.handleMessageHistorySelect} selected={this.state.compareMessage} node={this.props.node} /></div>
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
    valueRendererDisplayMode: state.settings.valueRendererDisplayMode,
    node: state.tree.selectedTopic,
  }
}

const styles: StyleRulesCallback<string> = (theme: Theme) => {
  return {
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ValuePanel))
