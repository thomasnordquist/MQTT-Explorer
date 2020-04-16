import * as React from 'react'
import { default as AceEditor } from 'react-ace'
import { Theme, withTheme } from '@material-ui/core'
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/snippets/json'
import 'ace-builds/src-noconflict/snippets/xml'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import 'react-ace'

function Editor(props: {
  editorMode: string
  theme: Theme
  value: string | undefined
  onChange: (value: string) => void
}) {
  const editorOptions = {
    showLineNumbers: false,
    tabSize: 2,
  }

  return (
    <AceEditor
      style={{}}
      mode={props.editorMode}
      theme={props.theme.palette.type === 'dark' ? 'monokai' : 'dawn'}
      name="UNIQUE_ID_OF_DIV"
      width="100%"
      height="200px"
      enableSnippets={true}
      enableBasicAutocompletion={true}
      enableLiveAutocompletion={true}
      showPrintMargin={false}
      showGutter={true}
      value={props.value}
      onChange={props.onChange}
      setOptions={editorOptions}
      editorProps={{ $blockScrolling: true }}
    />
  )
}

export default withTheme(Editor)
