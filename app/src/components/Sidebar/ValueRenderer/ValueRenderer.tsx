import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import CodeDiff from '../CodeDiff'
import { AppState } from '../../../reducers'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'
import { connect } from 'react-redux'
import { ValueRendererDisplayMode } from '../../../reducers/Settings'
import { Fade } from '@material-ui/core'
import { Decoder } from '../../../../../backend/src/Model/Decoder'

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

  private renderDiffMode(message: q.Message, treeNode: q.TreeNode<any>, compare?: q.Message) {
    if (!message.payload) {
      return
    }

    const previousMessages = treeNode.messageHistory.toArray()
    const previousMessage = previousMessages[previousMessages.length - 2]
    const compareMessage = compare || previousMessage || message

    const compareValue = compareMessage.payload || message.payload
    const [currentStr, currentType] = Base64Message.format(message.payload, treeNode.type)
    const [compareStr, compareType] = Base64Message.format(compareValue, treeNode.type)

    const language = currentType === compareType && compareType === 'json' ? 'json' : undefined

    return <div>{this.renderDiff(currentStr, compareStr, undefined, language)}</div>
  }

  private renderRawMode(message: q.Message, treeNode: q.TreeNode<any>, compare?: q.Message) {
    if (!message.payload) {
      return
    }

    const [currentStr, currentType] = Base64Message.format(message.payload, treeNode.type)
    const [compareStr, compareType] =
      compare && compare.payload ? Base64Message.format(compare.payload, treeNode.type) : [undefined, undefined]

    return (
      <div>
        {this.renderDiff(currentStr, currentStr, undefined, currentType)}
        <Fade in={Boolean(compareStr)} timeout={400}>
          <div>{Boolean(compareStr) ? this.renderDiff(compareStr, compareStr, 'selected', compareType) : null}</div>
        </Fade>
      </div>
    )
  }

  public render() {
    return (
      <div style={{ padding: '0px 0px 8px 0px', width: '100%' }}>
        {this.props.message?.payload?.decoder === Decoder.SPARKPLUG && 'Decoded SparkplugB'}
        {this.renderValue()}
      </div>
    )
  }

  public renderValue() {
    const { message, treeNode, compareWith, renderMode } = this.props
    if (!message.payload) {
      return null
    }

    switch (renderMode) {
      case 'diff':
        return this.renderDiffMode(message, treeNode, compareWith)
      default:
        return this.renderRawMode(message, treeNode, compareWith)
    }
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    renderMode: state.settings.get('valueRendererDisplayMode'),
  }
}

export default connect(mapStateToProps)(ValueRenderer)
