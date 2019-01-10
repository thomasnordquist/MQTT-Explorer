import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import { makePublishEvent, rendererEvents } from '../../../../events'
import Navigation from '@material-ui/icons/Navigation'
import {
  Button, Fab, InputAdornment, FormControlLabel, Radio,
  RadioGroup, TextField, Typography,
} from '@material-ui/core'

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
}

interface State {
  customTopic?: string
  payload?: string
  mode: string
}

class Publisher extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { mode: 'json' }
  }

  private updatePayload = (value: string, event?: any) => {
    this.setState({ payload: value })
  }

  private updateTopic = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ customTopic: e.target.value })
  }

  private updateMode = (e: React.ChangeEvent<{}>, value: string) => {
    this.setState({ mode: value })
  }

  private publish = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!this.props.connectionId || !this.state.customTopic) {
      return
    }

    rendererEvents.emit(makePublishEvent(this.props.connectionId), {
      topic: this.state.customTopic,
      payload: this.state.payload,
    })
  }

  public render() {
    return (
      <div style={{ flexGrow: 1, marginLeft: '8px' }}>
        {this.topic()}
        {this.editor()}
      </div>
    )
  }

  private topic() {
    const { node } = this.props
    const topicStr = this.state.customTopic || (node ? node.path() : '')
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
        />
      </div>
    )
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
      <Button variant="contained" size="small" color="primary">
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
          value={this.state.payload}
          onChange={this.updatePayload}
          setOptions={this.editorOptions}
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    )
  }
}

export default Publisher
