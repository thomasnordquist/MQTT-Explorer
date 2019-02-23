import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import MonacoEditor, { MonacoDiffEditor, MonacoEditorBaseProps, MonacoEditorProps } from 'react-monaco-editor'
import ReactResizeDetector from 'react-resize-detector'
import { Theme, withTheme } from '@material-ui/core/styles'
import * as diff from 'diff'

interface Props {
  node?: q.TreeNode<any>,
  theme: Theme
}

interface State {
  width: number
  modifiedValue?: string
  node?: q.TreeNode<any>
  currentMessage?: q.Message
}

class ValueRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { width: 0, node: props.node }
  }

  public render() {
    return <div style={{ padding: '8px 0px 8px 8px' }}>{this.renderValue()}</div>
  }

  public renderValue() {
    const { node } = this.props
    if (!node || !node.message) {
      return null
    }

    const message = node.message
    const previousMessages = node.messageHistory.toArray()
    const previousMessage = previousMessages[previousMessages.length - 2]
    debugger
    let json
    try {
      json = JSON.parse(message.value)
    } catch (error) {
      return this.renderRawValue(message.value)
    }

    if (typeof json === 'string') {
      return this.renderRawValue(message.value)
    } else if (typeof json === 'number') {
      return this.renderRawValue(message.value)
    } else if (typeof json === 'boolean') {
      return this.renderRawValue(message.value)
    } else {
      const theme = (this.props.theme.palette.type === 'dark') ? 'monokai' : 'bright:inverted'
      const current = this.messageToPrettyJson(message)
      const previous = this.messageToPrettyJson(previousMessage)

      return (
        <div>
          <ReactResizeDetector handleWidth={true} onResize={this.updateWidth} />
          {this.renderDiff(current, previous || current)}
        </div>
      )
    }
  }

  public static getDerivedStateFromProps(props: Props, state: State) {
    const discardEdit = props.node !== state.node || (props.node && props.node.message !== state.currentMessage)
    return {
      ...state,
      node: props.node,
      currentMessage: props.node && props.node.message,
      modifiedValue: discardEdit ? undefined : state.modifiedValue,
    }
  }

  private heightForLines(lines: number) {
    return 0 + (lines * 18)
  }

  private editorOptions = {
    lineHeigh: 16,
    lineNumbers: 'off' as 'off',
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    theme: 'vs-dark',
  }

  private renderDiff(current: string = '', previous: string = '') {
    const value = this.state.modifiedValue !== undefined ? this.state.modifiedValue : current
    const lines = this.expectedLineCountFor(value, previous)
    const height = this.heightForLines(lines)
    return (
      <MonacoDiffEditor
        language="json"
        height={Math.min(height, 200)}
        options={{ ...this.editorOptions, renderSideBySide: false }}
        onChange={value => this.setState({ modifiedValue: value })}
        original={previous}
        width={this.state.width}
        value={value}
      />
    )
  }

  private expectedLineCountFor(current?: string, original?: string): number {
    if (current === undefined) {
      return 0
    }

    const originalStr = original || ''
    const changes = diff.diffLines(originalStr, current)

    const added = changes
      .map((change) => {
        const added = (change.added && change.count) || 0
        const removed = (change.removed && change.count) || 0

        return Math.abs(added)
      })
      .reduce((a, b) => a + b, 0)

    const originalLines = originalStr.split('\n').length

    return originalLines + added
  }

  private messageToPrettyJson(message?: q.Message): string | undefined {
    if (!message || !message.value) {
      return undefined
    }

    try {
      const json = JSON.parse(message.value)
      return JSON.stringify(json, undefined, '  ')
    } catch {
      return undefined
    }
  }

  private updateWidth = (width: number) => {
    this.setState({ width })
  }

  private renderRawValue(value: string) {
    const style: React.CSSProperties = {
      padding: '8px 12px 8px 12px',
      backgroundColor: 'rgba(100, 100, 100, 0.55)',
      wordBreak: 'break-all',
      width: '100%',
      overflow: 'auto hidden',
      display: 'block',
      lineHeight: '1.2em',
      color: this.props.theme.palette.text.primary,
    }

    return <pre style={style}><code>{value}</code></pre>
  }
}

export default withTheme()(ValueRenderer)
