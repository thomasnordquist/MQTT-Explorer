import { AttachFileOutlined, FormatAlignLeft } from '@mui/icons-material'
import Navigation from '@mui/icons-material/Navigation'
import React, { useCallback, useMemo, useState, useRef, memo } from 'react'
import { bindActionCreators } from 'redux'
import { Button, Fab, Tooltip } from '@mui/material'
import { connect } from 'react-redux'
import { default as AceEditor } from 'react-ace'
import Editor from './Editor'
import Message from './Model/Message'
import PublishHistory from './PublishHistory'
import RetainSwitch from './RetainSwitch'
import TopicInput from './TopicInput'
import { AppState } from '../../../reducers'
import { EditorModeSelect } from './EditorModeSelect'
import { globalActions, publishActions } from '../../../actions'
import { KeyCodes } from '../../../utils/KeyCodes'

interface Props {
  connectionId?: string
  topic?: string
  payload?: string
  actions: typeof publishActions
  globalActions: typeof globalActions
  retain: boolean
  editorMode: string
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
  const editorRef = useRef<AceEditor>()
  const [history, amendToHistory] = useHistory()

  const focusEditor = useCallback(() => {
    editorRef.current?.editor.focus()
  }, [editorRef])

  const publish = useCallback(() => {
    if (!props.connectionId) {
      return
    }

    props.actions.publish(props.connectionId)

    const topic = props.topic || ''
    const { payload } = props
    if (props.connectionId && topic) {
      amendToHistory(topic, payload)
    }
  }, [props, props.connectionId, props.topic, props.payload, amendToHistory])

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
      <div style={{ flexGrow: 1, width: '100%' }} onKeyDown={handleSubmit}>
        <TopicInput />
        <div style={{ width: '100%', display: 'block' }}>
          <EditorMode
            focusEditor={focusEditor}
            actions={props.actions}
            globalActions={props.globalActions}
            payload={props.payload}
            editorMode={props.editorMode}
            publish={publish}
          />
          <Editor
            value={props.payload}
            editorMode={props.editorMode}
            onChange={props.actions.setPayload}
            editorRef={editorRef as any}
          />
          <RetainSwitch />
        </div>
        <PublishHistory history={history} />
      </div>
    ),
    [props.payload, props.editorMode, history, handleSubmit, publish]
  )
}

const EditorMode = memo(
  (props: {
    payload?: string
    editorMode: string
    focusEditor: () => void
    actions: typeof publishActions
    globalActions: typeof globalActions
    publish: () => void
  }) => {
    const updatePayload = props.actions.setPayload

    const updateMode = useCallback((e: React.ChangeEvent<{}>, value: string) => {
      props.actions.setEditorMode(value)
    }, [])

    const openFile = useCallback(() => {
      props.actions.openFile()
    }, [])

    const formatJson = useCallback(() => {
      if (props.payload) {
        try {
          const str = JSON.stringify(JSON.parse(props.payload), undefined, '  ')
          updatePayload(str)
        } catch (error) {
          props.globalActions.showError(`Format error: ${(error as Error)?.message}`)
        }
      }
    }, [props.payload])

    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ width: '100%', lineHeight: '64px', textAlign: 'center' }}>
          <EditorModeSelect value={props.editorMode} onChange={updateMode} focusEditor={props.focusEditor} />
          <FormatJsonButton editorMode={props.editorMode} focusEditor={props.focusEditor} formatJson={formatJson} />
          <OpenFileButton editorMode={props.editorMode} openFile={openFile} />
          <div style={{ float: 'right' }}>
            <PublishButton publish={props.publish} focusEditor={props.focusEditor} />
          </div>
        </div>
      </div>
    )
  }
)

const FormatJsonButton = React.memo(
  (props: { editorMode: string; focusEditor: () => void; formatJson: () => void }) => {
    if (props.editorMode !== 'json') {
      return null
    }

    return (
      <Tooltip title="Format JSON">
        <Fab
          style={{ width: '36px', height: '36px', margin: '0 8px' }}
          onClick={props.formatJson}
          onFocus={props.focusEditor}
          id="sidebar-publish-format-json"
        >
          <FormatAlignLeft style={{ fontSize: '20px' }} />
        </Fab>
      </Tooltip>
    )
  }
)

const OpenFileButton = React.memo((props: { editorMode: string; openFile: () => void }) => (
  <Tooltip title="Open file">
    <Fab
      style={{ width: '36px', height: '36px', margin: '0 8px' }}
      onClick={props.openFile}
      id="sidebar-publish-open-file"
    >
      <AttachFileOutlined style={{ fontSize: '20px' }} />
    </Fab>
  </Tooltip>
))

const PublishButton = memo((props: { publish: () => void; focusEditor: () => void }) => {
  const handleClickPublish = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      props.publish()
    },
    [props.publish]
  )

  return (
    <Button
      variant="contained"
      size="small"
      color="primary"
      onClick={handleClickPublish}
      onFocus={props.focusEditor}
      id="publish-button"
    >
      <Navigation style={{ marginRight: '8px' }} /> Publish
    </Button>
  )
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(publishActions, dispatch),
  globalActions: bindActionCreators(globalActions, dispatch),
})

const mapStateToProps = (state: AppState) => ({
  topic: state.publish.manualTopic,
  payload: state.publish.payload,
  editorMode: state.publish.editorMode,
  retain: state.publish.retain,
})

export default connect(mapStateToProps, mapDispatchToProps)(Publish)
