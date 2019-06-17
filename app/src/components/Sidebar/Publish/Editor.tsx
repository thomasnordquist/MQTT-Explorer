import * as React from 'react'
import { default as AceEditor } from 'react-ace'
import { Theme, withTheme } from '@material-ui/core'
import 'brace/mode/json'
import 'brace/theme/dawn'
import 'brace/theme/monokai'
import 'brace/mode/xml'
import 'brace/mode/text'
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
      showGutter={true}
      value={props.value}
      onChange={props.onChange}
      setOptions={editorOptions}
      editorProps={{ $blockScrolling: true }}
    />
  )
}

export default withTheme(Editor)
