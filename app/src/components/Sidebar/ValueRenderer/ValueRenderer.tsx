import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import CodeDiff from '../CodeDiff'
import { AppState } from '../../../reducers'
import { connect } from 'react-redux'
import { ValueRendererDisplayMode } from '../../../reducers/Settings'
import { Fade } from '@material-ui/core'
import { Decoder } from '../../../../../backend/src/Model/Decoder'
import { DecoderFunction, useDecoder } from '../../hooks/useDecoder'

interface Props {
  message: q.Message
  treeNode: q.TreeNode<any>
  compareWith?: q.Message
  renderMode: ValueRendererDisplayMode
}

export const ValueRenderer: React.FC<Props> = props => {
  const decodeMessage = useDecoder(props.treeNode)

  function renderDiff(current: string = '', previous: string = '', title?: string, language?: 'json') {
    return (
      <CodeDiff
        treeNode={props.treeNode}
        previous={previous}
        current={current}
        title={title}
        language={language}
        nameOfCompareMessage={props.compareWith ? 'selected' : 'previous'}
      />
    )
  }

  function renderDiffMode(
    decodeMessage: DecoderFunction,
    message: q.Message,
    treeNode: q.TreeNode<any>,
    compare?: q.Message
  ) {
    if (!message.payload) {
      return
    }

    const previousMessages = treeNode.messageHistory.toArray()
    const previousMessage = previousMessages[previousMessages.length - 2]
    const compareMessage = compare || previousMessage || message

    const [currentStr, currentType] = decodeMessage(message)?.format(treeNode.type) ?? []
    const [compareStr, compareType] = decodeMessage(compareMessage)?.format(treeNode.type) ?? []

    const language = currentType === compareType && compareType === 'json' ? 'json' : undefined

    return <div>{renderDiff(currentStr, compareStr, undefined, language)}</div>
  }

  function renderRawMode(
    decodeMessage: DecoderFunction,
    message: q.Message,
    treeNode: q.TreeNode<any>,
    compare?: q.Message
  ) {
    if (!message.payload) {
      return
    }

    const [currentStr, currentType] = decodeMessage(message)?.format(treeNode.type) ?? []
    const [compareStr, compareType] =
      compare && compare.payload ? decodeMessage(compare)?.format(treeNode.type) ?? [] : []

    return (
      <div>
        {renderDiff(currentStr, currentStr, undefined, currentType)}
        <Fade in={Boolean(compareStr)} timeout={400}>
          <div>{Boolean(compareStr) ? renderDiff(compareStr, compareStr, 'selected', compareType) : null}</div>
        </Fade>
      </div>
    )
  }

  function renderValue(decodeMessage: DecoderFunction) {
    const { message, treeNode, compareWith, renderMode } = props
    if (!message.payload) {
      return null
    }

    switch (renderMode) {
      case 'diff':
        return renderDiffMode(decodeMessage, message, treeNode, compareWith)
      default:
        return renderRawMode(decodeMessage, message, treeNode, compareWith)
    }
  }

  return (
    <div style={{ padding: '0px 0px 8px 0px', width: '100%' }}>
      {props.message?.payload?.decoder === Decoder.SPARKPLUG && 'Decoded SparkplugB'}
      {renderValue(decodeMessage)}
    </div>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    renderMode: state.settings.get('valueRendererDisplayMode'),
  }
}

export default connect(mapStateToProps)(ValueRenderer)
