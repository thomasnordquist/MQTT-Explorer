import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import CodeDiff from '../CodeDiff'
import { AppState } from '../../../reducers'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'
import { connect } from 'react-redux'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { ValueRendererDisplayMode } from '../../../reducers/Settings'

interface Props {
  message: q.Message
  treeNode: q.TreeNode<any>
  compareWith?: q.Message
  renderMode: ValueRendererDisplayMode
}

interface State {
  width: number
}

class ValueRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { width: 0 }
  }

  private renderDiff(current: string = '', previous: string = '', language?: 'json') {
    return (
      <CodeDiff
        treeNode={this.props.treeNode}
        previous={previous}
        current={current}
        language={language}
        nameOfCompareMessage={this.props.compareWith ? 'selected' : 'previous'}
      />
    )
  }

  private messageToPrettyJson(str: string): string | undefined {
    try {
      const json = JSON.parse(str)
      return JSON.stringify(json, undefined, '  ')
    } catch {
      return undefined
    }
  }

  private updateWidth = (width: number) => {
    if (width !== this.state.width) {
      this.setState({ width })
    }
  }

  private renderRawValue(value: string, compare: string) {
    return this.renderDiff(value, compare)
  }

  public render() {
    return (
      <div style={{ padding: '0px 0px 8px 8px' }}>
        <ReactResizeDetector handleWidth={true} onResize={this.updateWidth} />
        {this.renderValue()}
      </div>
    )
  }

  public renderValue() {
    const { message, treeNode, compareWith, renderMode } = this.props
    const previousMessages = treeNode.messageHistory.toArray()
    const previousMessage = previousMessages[previousMessages.length - 2]
    let compareMessage = compareWith || previousMessage || message
    if (renderMode === 'raw') {
      compareMessage = message
    }
    if (!message.value) {
      return null
    }

    const compareValue = compareMessage.value || message.value
    const str = Base64Message.toUnicodeString(message.value)
    const compareStr = Base64Message.toUnicodeString(compareValue)

    let json
    try {
      json = JSON.parse(str)
    } catch (error) {
      return this.renderRawValue(str, compareStr)
    }

    if (typeof json === 'string') {
      return this.renderRawValue(str, compareStr)
    } else if (typeof json === 'number') {
      return this.renderRawValue(str, compareStr)
    } else if (typeof json === 'boolean') {
      return this.renderRawValue(str, compareStr)
    } else {
      const current = this.messageToPrettyJson(str) || str
      const compare = this.messageToPrettyJson(compareStr) || compareStr
      const language = current && compare ? 'json' : undefined

      return this.renderDiff(current, compare, language)
    }
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    renderMode: state.settings.get('valueRendererDisplayMode'),
  }
}

export default connect(mapStateToProps)(ValueRenderer)
