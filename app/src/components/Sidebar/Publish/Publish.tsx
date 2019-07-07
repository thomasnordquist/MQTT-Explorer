import Editor from './Editor'
import FormatAlignLeft from '@material-ui/icons/FormatAlignLeft'
import Message from './Model/Message'
import Navigation from '@material-ui/icons/Navigation'
import PublishHistory from './PublishHistory'
import React, { useCallback, useState, useMemo } from 'react'
import TopicInput from './TopicInput'
import { AppState } from '../../../reducers'
import { bindActionCreators } from 'redux'
import { Button, Fab, Theme, Tooltip, withTheme } from '@material-ui/core'
import { connect } from 'react-redux'
import { EditorModeSelect } from './EditorModeSelect'
import { globalActions, publishActions } from '../../../actions'
import { KeyCodes } from '../../../utils/KeyCodes'
import RetainSwitch from './RetainSwitch'

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

function useHistory(): [Array<Message>, (topic: string, payload?: string) => void] {
  const [history, setHistory] = useState<Array<Message>>([])
  const amendToHistory = useCallback(
    (topic: string, payload?: string) => {
      // Remove duplicates
      let filteredHistory = history.filter(e => e.payload !== payload || e.topic !== topic)
      filteredHistory = filteredHistory.slice(-7)
      setHistory([...filteredHistory, { topic, payload, sent: new Date() }])
    },
    [history]
  )

  return [history, amendToHistory]
}

function Publish(props: Props) {
  console.log(props.connectionId)
  const updatePayload = props.actions.setPayload
  const [history, amendToHistory] = useHistory()

  const updateMode = useCallback((e: React.ChangeEvent<{}>, value: string) => {
    props.actions.setEditorMode(value)
  }, [])

  const publish = useCallback(() => {
    if (!props.connectionId) {
      return
    }

    props.actions.publish(props.connectionId)

    const topic = props.topic || ''
    const payload = props.payload
    if (props.connectionId && topic) {
      amendToHistory(topic, payload)
    }
  }, [props, props.connectionId, props.topic, props.payload, amendToHistory])

  const handleClickPublish = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      publish()
    },
    [publish]
  )

  const PublishButton = () => {
    return (
      <Button variant="contained" size="small" color="primary" onClick={handleClickPublish} id="publish-button">
        <Navigation style={{ marginRight: '8px' }} /> Publish
      </Button>
    )
  }

  const formatJson = () => {
    if (props.payload) {
      try {
        const str = JSON.stringify(JSON.parse(props.payload), undefined, '  ')
        updatePayload(str)
      } catch (error) {
        props.globalActions.showError(`Format error: ${error.message}`)
      }
    }
  }

  const renderFormatJson = () => {
    if (props.editorMode !== 'json') {
      return null
    }

    return (
      <Tooltip title="Format JSON">
        <Fab
          style={{ width: '36px', height: '36px', marginLeft: '8px' }}
          onClick={formatJson}
          id="sidebar-publish-format-json"
        >
          <FormatAlignLeft style={{ fontSize: '20px' }} />
        </Fab>
      </Tooltip>
    )
  }

  function EditorMode() {
    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ width: '100%', lineHeight: '64px' }}>
          <EditorModeSelect value={props.editorMode} onChange={updateMode} />
          {renderFormatJson()}
          <div style={{ float: 'right', marginRight: '16px' }}>
            <PublishButton />
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.keyCode === KeyCodes.enter && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        publish()
      }
    },
    [publish]
  )

  return useMemo(
    () => (
      <div style={{ flexGrow: 1, marginLeft: '8px' }} onKeyDown={handleSubmit}>
        <TopicInput />
        <div style={{ width: '100%', display: 'block' }}>
          <EditorMode />
          <Editor value={props.payload} editorMode={props.editorMode} onChange={updatePayload} />
          <RetainSwitch />
        </div>
        <PublishHistory history={history} />
      </div>
    ),
    [props.payload, props.editorMode, history, handleSubmit, updatePayload]
  )
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
