import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import ClearAdornment from '../../helper/ClearAdornment'
import FormatAlignLeft from '@material-ui/icons/FormatAlignLeft'
import History from '../HistoryDrawer'
import Message from './Model/Message'
import Navigation from '@material-ui/icons/Navigation'
import { AppState } from '../../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { globalActions, publishActions } from '../../../actions'

import {
  Button,
  FormControlLabel,
  FormControl,
  InputLabel,
  Input,
  Checkbox,
  Tooltip,
  Fab,
  Theme,
  withTheme,
} from '@material-ui/core'
import { EditorModeSelect } from './EditorModeSelect'
import QosSelect from './QosSelect'
import Editor from './Editor'

const sha1 = require('sha1')

interface Props {
  connectionId?: string
  topic?: string
  payload?: string
  actions: typeof publishActions
  globalActions: typeof globalActions
  retain: boolean
  editorMode: string
  theme: Theme
}

interface State {
  history: Array<Message>
}

class Publish extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { history: [] }
  }

  private updatePayload = (payload: string) => {
    this.props.actions.setPayload(payload)
  }

  private updateTopic = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.actions.setTopic(e.target.value)
  }

  private updateMode = (e: React.ChangeEvent<{}>, value: string) => {
    this.props.actions.setEditorMode(value)
  }

  private publish = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!this.props.connectionId) {
      return
    }

    this.props.actions.publish(this.props.connectionId)

    const topic = this.props.topic || ''
    const payload = this.props.payload
    if (this.props.connectionId && topic) {
      this.addMessageToHistory(topic, payload)
    }
  }

  private addMessageToHistory(topic: string, payload?: string) {
    // Remove duplicates
    let filteredHistory = this.state.history.filter(e => e.payload !== payload || e.topic !== topic)
    filteredHistory = filteredHistory.slice(-7)
    const history: Array<Message> = [...filteredHistory, { topic, payload, sent: new Date() }]
    this.setState({ history })
  }

  private clearTopic = () => {
    this.props.actions.setTopic('')
  }

  private topic() {
    const topicStr = this.props.topic || ''

    return (
      <div>
        <FormControl style={{ width: '100%' }}>
          <InputLabel htmlFor="publish-topic">Topic</InputLabel>
          <Input
            id="publish-topic"
            value={topicStr}
            startAdornment={<span />}
            endAdornment={<ClearAdornment action={this.clearTopic} value={topicStr} />}
            onBlur={this.onTopicBlur}
            onChange={this.updateTopic}
            multiline={true}
            placeholder="example/topic"
          />
        </FormControl>
      </div>
    )
  }

  private onTopicBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      this.props.actions.setTopic(undefined)
    }
  }

  private publishButton() {
    return (
      <Button variant="contained" size="small" color="primary" onClick={this.publish} id="publish-button">
        <Navigation style={{ marginRight: '8px' }} /> Publish
      </Button>
    )
  }

  private formatJson = () => {
    if (this.props.payload) {
      try {
        const str = JSON.stringify(JSON.parse(this.props.payload), undefined, '  ')
        this.updatePayload(str)
      } catch (error) {
        this.props.globalActions.showError(`Format error: ${error.message}`)
      }
    }
  }

  private renderFormatJson() {
    if (this.props.editorMode !== 'json') {
      return null
    }

    return (
      <Tooltip title="Format JSON">
        <Fab
          style={{ width: '36px', height: '36px', marginLeft: '8px' }}
          onClick={this.formatJson}
          id="sidebar-publish-format-json"
        >
          <FormatAlignLeft style={{ fontSize: '20px' }} />
        </Fab>
      </Tooltip>
    )
  }

  private editorMode() {
    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ width: '100%', lineHeight: '64px' }}>
          <EditorModeSelect value={this.props.editorMode} onChange={this.updateMode} />
          {this.renderFormatJson()}
          <div style={{ float: 'right', marginRight: '16px' }}>{this.publishButton()}</div>
        </div>
      </div>
    )
  }

  private publishMode() {
    const labelStyle = { margin: '0 8px 0 8px' }

    return (
      <div style={{ marginTop: '8px', clear: 'both' }}>
        <div style={{ width: '100%', textAlign: 'right' }}>
          <FormControlLabel style={labelStyle} control={<QosSelect />} label="QoS" labelPlacement="start" />
          <Tooltip
            title="Retained messages only appear to be retained, when client subscribes after the initial publish."
            placement="top"
          >
            <FormControlLabel
              value="retain"
              style={labelStyle}
              control={
                <Checkbox color="primary" checked={this.props.retain} onChange={this.props.actions.toggleRetain} />
              }
              label="retain"
              labelPlacement="end"
            />
          </Tooltip>
        </div>
      </div>
    )
  }

  private history() {
    const items = [...this.state.history].reverse().map(message => ({
      key: sha1(message.topic + message.payload),
      title: message.topic,
      value: message.payload || '',
    }))
    return <History items={items} onClick={this.didSelectHistoryEntry} />
  }

  private didSelectHistoryEntry = (index: number) => {
    const message = this.state.history[index]
    this.props.actions.setTopic(message.topic)
    this.props.actions.setPayload(message.payload)
  }

  public render() {
    return (
      <div style={{ flexGrow: 1, marginLeft: '8px' }}>
        {this.topic()}
        <div style={{ width: '100%', display: 'block' }}>
          {this.editorMode()}
          <Editor value={this.props.payload} editorMode={this.props.editorMode} onChange={this.updatePayload} />
          {this.publishMode()}
        </div>
        {this.history()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(publishActions, dispatch),
    globalActions: bindActionCreators(globalActions, dispatch),
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    topic: state.publish.topic,
    payload: state.publish.payload,
    editorMode: state.publish.editorMode,
    retain: state.publish.retain,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Publish))
