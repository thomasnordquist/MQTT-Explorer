import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as q from '../../../../../backend/src/Model'
import { AppState } from '../../../reducers'
import { rendererEvents, makePublishEvent } from '../../../../../events'
import { sidebarActions } from '../../../actions'
import Navigation from '@material-ui/icons/Navigation'
import {
  Button, Fab, InputAdornment, FormControlLabel, Radio,
  RadioGroup, TextField, Typography,
} from '@material-ui/core'
import Message from './Model/Message'
import HistoryEntry from './HistoryEntry'

import * as brace from 'brace'
import { default as AceEditor } from 'react-ace'
// tslint:disable-next-line
import 'react-ace'
import 'brace/mode/json'
import 'brace/mode/text'
import 'brace/mode/xml'
import 'brace/theme/monokai'

interface Props {
  node?: q.TreeNode
  connectionId?: string
  topic?: string
  payload?: string
  actions: any
}

interface State {
  mode: string
  history: Message[]
}

class Publisher extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { mode: 'json', history: [] }
  }

  private updatePayload = (value: string, event?: any) => {
    this.props.actions.setPublishPayload(value)
  }

  private updateTopic = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    this.props.actions.setPublishTopic(e.target.value)
  }

  private updateMode = (e: React.ChangeEvent<{}>, value: string) => {
    this.setState({ mode: value })
  }

  private publish = (e: React.MouseEvent) => {
    e.stopPropagation()
    const topic = this.currentTopic() || ''
    const payload = this.props.payload

    if (this.props.connectionId && topic) {
      rendererEvents.emit(makePublishEvent(this.props.connectionId), { topic, payload })
      this.addMessageToHistory(topic, payload)
    }
  }

  private addMessageToHistory(topic: string, payload?: string) {
    // Remove duplicates
    let filteredHistory = this.state.history.filter(e => e.payload !== payload || e.topic !== topic)
    filteredHistory = filteredHistory.slice(-7)
    const history: Message[] = [...filteredHistory, { topic, payload, sent: new Date() }]
    this.setState({ history })
  }

  public render() {
    return (
      <div style={{ flexGrow: 1, marginLeft: '8px' }}>
        {this.topic()}
        {this.editor()}
        {this.history()}
      </div>
    )
  }

  private currentTopic(): string | undefined {
    const { node, topic } = this.props
    const selectedNodePath = (node ? node.path() : undefined)

    return (topic !== undefined) ? topic : selectedNodePath
  }

  private topic() {
    const topicStr = this.currentTopic() || ''

    return (
      <div>
        <Typography>Topic</Typography>
        <TextField
          placeholder="example/topic"
          style={{ width: '100%' }}
          margin="normal"
          value={topicStr}
          multiline={true}
          onChange={this.updateTopic}
          InputProps={{ onBlur: this.onTopicBlur }}
        />
      </div>
    )
  }

  private onTopicBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      this.props.actions.setPublishTopic(undefined)
    }
  }

  private editorOptions = {
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
    showLineNumbers: false,
    tabSize: 2,
  }

  private publishButton() {
    return (
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={this.publish}
      >
        <Navigation style={{ marginRight: '8px' }} /> Publish
      </Button>
    )
  }

  private editorMode() {
    const labelStyle = { margin: '0 8px 0 8px' }
    return (
      <div style={{ marginTop: '16px' }}>
        <Typography style={{ width: '100%', lineHeight: '64px' }}>
          <RadioGroup
            style={{ display: 'inline-block', float: 'left' }}
            value={this.state.mode}
            onChange={this.updateMode}
            row={true}
          >
            <FormControlLabel
              value="text"
              style={labelStyle}
              control={<Radio color="primary" />}
              label="raw"
              labelPlacement="top"
            />
            <FormControlLabel
              value="xml"
              style={labelStyle}
              control={<Radio color="primary" />}
              label="xml"
              labelPlacement="top"
            />
            <FormControlLabel
              value="json"
              style={labelStyle}
              control={<Radio color="primary" />}
              label="json"
              labelPlacement="top"
            />
          </RadioGroup>
          <div style={{ float: 'right', marginRight: '16px' }}>
            {this.publishButton()}
          </div>
        </Typography>
      </div>
    )
  }

  private history() {
    const entries = this.state.history.map(message => (
      <HistoryEntry message={message} />
    ))

    return (
      <div style={{ marginTop: '8px' }}>
        <Typography>History</Typography>
        {entries}
      </div>
    )
  }

  private editor() {
    return (
      <div style={{ width: '100%', display: 'block' }}>
        {this.editorMode()}
        <AceEditor
          mode={this.state.mode}
          theme="monokai"
          name="UNIQUE_ID_OF_DIV"
          width="100%"
          height="200px"
          showGutter={true}
          value={this.props.payload}
          onChange={this.updatePayload}
          setOptions={this.editorOptions}
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(sidebarActions, dispatch),
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    topic: state.sidebar.publishTopic,
    payload: state.sidebar.publishPayload,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Publisher)
