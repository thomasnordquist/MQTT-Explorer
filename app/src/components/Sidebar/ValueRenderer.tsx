import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import { MonacoDiffEditor } from 'react-monaco-editor'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { Theme, withTheme } from '@material-ui/core/styles'
import * as diff from 'diff'

interface Props {
  node?: q.TreeNode<any>,
  compareWith?: q.Message
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
    const compareMessage = this.props.compareWith || previousMessage || message

    let json
    try {
      json = JSON.parse(message.value)
    } catch (error) {
      return this.renderRawValue(message.value, compareMessage.value)
    }

    if (typeof json === 'string') {
      return this.renderRawValue(message.value, compareMessage.value)
    } else if (typeof json === 'number') {
      return this.renderRawValue(message.value, compareMessage.value)
    } else if (typeof json === 'boolean') {
      return this.renderRawValue(message.value, compareMessage.value)
    } else {
      const current = this.messageToPrettyJson(message)
      const compare = this.messageToPrettyJson(compareMessage)
      const language = current && compare ? 'json' : undefined

      return this.renderDiff(current, compare, language)
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

  private renderDiff(current: string = '', previous: string = '', language: 'json' | undefined) {
    const theme = (this.props.theme.palette.type === 'dark') ? 'monokai' : 'bright:inverted'

    const value = this.state.modifiedValue !== undefined ? this.state.modifiedValue : current
    const lines = this.expectedLineCountFor(value, previous)
    const height = this.heightForLines(lines)
    return (
      <div>
        <ReactResizeDetector handleWidth={true} onResize={this.updateWidth} />
        <MonacoDiffEditor
          key="editor"
          language={language}
          height={Math.min(height, 200)}
          options={{ ...this.editorOptions, renderSideBySide: false }}
          onChange={value => this.setState({ modifiedValue: value })}
          original={previous}
          width={this.state.width}
          value={value}
        />
      </div>
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

        return Math.abs(added)
      })
      .reduce((a: number, b: number) => a + b, 0)

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

  private renderRawValue(value: string, compare?: string) {
    return this.renderDiff(value, compare, undefined)
  }
}

export default withTheme()(ValueRenderer)
