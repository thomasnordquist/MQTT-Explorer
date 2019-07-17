import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import CodeDiff from '../CodeDiff'
import { AppState } from '../../../reducers'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'
import { connect } from 'react-redux'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { ValueRendererDisplayMode } from '../../../reducers/Settings'
import { Typography, Fade, Grow } from '@material-ui/core'

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

  private renderDiff(current: string = '', previous: string = '', title?: string, language?: 'json') {
    return (
      <CodeDiff
        treeNode={this.props.treeNode}
        previous={previous}
        current={current}
        title={title}
        language={language}
        nameOfCompareMessage={this.props.compareWith ? 'selected' : 'previous'}
      />
    )
  }

  private convertMessage(msg?: Base64Message): [string | undefined, 'json' | undefined] {
    if (!msg) {
      return [undefined, undefined]
    }

    const str = Base64Message.toUnicodeString(msg)
    try {
      JSON.parse(str)
    } catch (error) {
      return [str, undefined]
    }

    return [this.messageToPrettyJson(str), 'json']
  }

  private messageToPrettyJson(str: string): string | undefined {
    try {
      const json = JSON.parse(str)
      return JSON.stringify(json, undefined, '  ')
    } catch {
      return undefined
    }
  }

  private renderRawMode(message: q.Message, compare?: q.Message) {
    if (!message.value) {
      return
    }
    const [value, valueLanguage] = this.convertMessage(message.value)
    const [compareStr, compareStrLanguage] =
      compare && compare.value ? this.convertMessage(compare.value) : [undefined, undefined]

    return (
      <div>
        {this.renderDiff(value, value, undefined, valueLanguage)}
        <Fade in={Boolean(compareStr)} timeout={400}>
          <div>
            {Boolean(compareStr) ? this.renderDiff(compareStr, compareStr, 'selected', compareStrLanguage) : null}
          </div>
        </Fade>
      </div>
    )
  }

  public render() {
    return <div style={{ padding: '0px 0px 8px 0px', width: '100%' }}>{this.renderValue()}</div>
  }

  public renderValue() {
    const { message, treeNode, compareWith, renderMode } = this.props
    const previousMessages = treeNode.messageHistory.toArray()
    const previousMessage = previousMessages[previousMessages.length - 2]
    const compareMessage = compareWith || previousMessage || message

    if (renderMode === 'raw') {
      return this.renderRawMode(message, compareWith)
    }
    if (!message.value) {
      return null
    }

    const compareValue = compareMessage.value || message.value
    const [current, currentLanguage] = this.convertMessage(message.value)
    const [compare, compareLanguage] = this.convertMessage(compareValue)

    const language = currentLanguage === compareLanguage && compareLanguage === 'json' ? 'json' : undefined

    return this.renderDiff(current, compare, undefined, language)
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    renderMode: state.settings.get('valueRendererDisplayMode'),
  }
}

export default connect(mapStateToProps)(ValueRenderer)
