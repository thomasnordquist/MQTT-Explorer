import 'react-ace'
import 'brace/mode/json'
import 'brace/mode/text'
import 'brace/mode/xml'
import 'brace/theme/monokai'

import * as React from 'react'
import * as q from '../../../../../backend/src/Model'

import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  FormControl,
  InputLabel,
  Input,
  Checkbox,
  MenuItem,
  Tooltip,
} from '@material-ui/core'

// tslint:disable-next-line
import { default as AceEditor } from 'react-ace'
import { AppState } from '../../../reducers'
import History from '../History'
import Message from './Model/Message'
import Navigation from '@material-ui/icons/Navigation'
import Clear from '@material-ui/icons/Clear'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { publishActions } from '../../../actions'
import ClearAdornment from '../../helper/ClearAdornment'
import { TopicViewModel } from '../../../TopicViewModel'

interface Props {
  node?: q.TreeNode<TopicViewModel>
  connectionId?: string
  topic?: string
  payload?: string
  actions: typeof publishActions
  retain: boolean
  editorMode: string
  qos: 0 | 1 | 2
}

interface State {
  history: Message[]
}

class Publish extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { history: [] }
  }

  private updatePayload = (payload: string, event?: any) => {
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
              startAdornment={<span/>}
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

  private editorOptions = {
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
        id="publish-button"
      >
        <Navigation style={{ marginRight: '8px' }} /> Publish
      </Button>
    )
  }

  private editorMode() {
    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ width: '100%', lineHeight: '64px' }}>
          {this.renderEditorModeSelection()}
          <div style={{ float: 'right', marginRight: '16px' }}>
            {this.publishButton()}
          </div>
        </div>
      </div>
    )
  }

  private renderEditorModeSelection() {
    const labelStyle = { margin: '0 8px 0 8px' }
    return (
      <RadioGroup
        style={{ display: 'inline-block', float: 'left' }}
        value={this.props.editorMode}
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
    )
  }

  private onChangeQoS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    if (value !== 0 && value !== 1 && value !== 2) {
      return
    }

    this.props.actions.setQoS(value)
  }

  private publishMode() {
    const labelStyle = { margin: '0 8px 0 8px' }
    const itemStyle = { padding: '0' }
    const tooltipStyle = { textAlign: 'center' as 'center', width: '100%' }
    const qosSelect = (
      <TextField
        select={true}
        value={this.props.qos}
        margin="normal"
        style={{ margin: '8px 0 8px 8px' }}
        onChange={this.onChangeQoS}
      >
        <MenuItem key={0} value={0} style={itemStyle}>
          <Tooltip title="At most once"><div style={tooltipStyle}>0</div></Tooltip>
        </MenuItem>
        <MenuItem key={1} value={1} style={itemStyle}>
          <Tooltip title="At least once"><div style={tooltipStyle}>1</div></Tooltip>
        </MenuItem>
        <MenuItem key={2} value={2} style={itemStyle}>
          <Tooltip title="Exactly once"><div style={tooltipStyle}>2</div></Tooltip>
        </MenuItem>
      </TextField>
    )
    return (
      <div style={{ marginTop: '8px', clear: 'both' }}>
        <div style={{ width: '100%', textAlign: 'right' }}>
          <FormControlLabel
            style={labelStyle}
            control={qosSelect}
            label="QoS"
            labelPlacement="start"
          />
          <Tooltip title="Retained messages only appear to be retained, when client subscribes after the initial publish." placement="top">
            <FormControlLabel
              value="retain"
              style={labelStyle}
              control={<Checkbox color="primary" checked={this.props.retain} onChange={this.props.actions.toggleRetain} />}
              label="retain"
              labelPlacement="end"
            />
          </Tooltip>
        </div>
      </div>
    )
  }

  private history() {
    const items = this.state.history.reverse().map(message => ({
      title: message.topic,
      value: message.payload,
    }))

    return <History items={items} onClick={this.didSelectHistoryEntry} />
  }

  private didSelectHistoryEntry = (index: number) => {
    const message = this.state.history[index]
    this.props.actions.setTopic(message.topic)
    this.props.actions.setPayload(message.payload)
  }

  private editor() {
    return (
      <div style={{ width: '100%', display: 'block' }}>
        {this.editorMode()}
        {this.renderEditor()}
        {this.publishMode()}
      </div>
    )
  }

  private renderEditor() {
    return (
      <AceEditor
        mode={this.props.editorMode}
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
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(publishActions, dispatch),
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    topic: state.publish.topic,
    payload: state.publish.payload,
    editorMode: state.publish.editorMode,
    retain: state.publish.retain,
    qos: state.publish.qos,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Publish)
