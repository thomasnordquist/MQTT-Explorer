import * as React from 'react'
import ShowChart from '@mui/icons-material/ShowChart'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as q from '../../../../../backend/src/Model'
import Copy from '../../helper/Copy'
import DateFormatter from '../../helper/DateFormatter'
import History from '../HistoryDrawer'
import TopicPlot from '../../TopicPlot'
import { isPlottable } from '../CodeDiff/util'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { chartActions } from '../../../actions'
import CustomIconButton from '../../helper/CustomIconButton'
import { MessageId } from '../MessageId'
import { useSubscription } from '../../hooks/useSubscription'
import { useDecoder } from '../../hooks/useDecoder'

const throttle = require('lodash.throttle')

interface Props {
  node?: q.TreeNode<TopicViewModel>
  selected?: q.Message
  onSelect: (message: q.Message) => void
  actions: {
    charts: typeof chartActions
  }
}

export const MessageHistory: React.FC<Props> = props => {
  const [, setLastUpdate] = React.useState(Date.now())
  const updateNodeThrottled = React.useCallback(
    throttle(() => {
      setLastUpdate
    }, 300),
    []
  )

  useSubscription(props.node?.onMessage, updateNodeThrottled)
  const decodeMessage = useDecoder(props.node)

  function addNodeToCharts(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    const { node } = props
    if (!node) {
      return null
    }

    props.actions.charts.addChart({ topic: node.path() })
  }

  function displayMessage(index: number, eventTarget: EventTarget) {
    const message = props.node && props.node.messageHistory.toArray().reverse()[index]
    if (message) {
      props.onSelect(message)
    }
  }

  const { node } = props
  if (!node) {
    return null
  }

  const history = node.messageHistory.toArray()
  let previousMessage: q.Message | undefined = node.message
  const historyElements = [...history].reverse().map((message, idx) => {
    const value = node.message ? (decodeMessage(message)?.message?.format()[0] ?? null) : null

    const element = {
      value: value ?? '',
      key: `${message.messageNumber}-${message.received}`,
      title: (
        <span>
          <div style={{ float: 'left' }}>
            <DateFormatter date={message.received} />
            {previousMessage && previousMessage !== message ? (
              <i>
                (-
                <DateFormatter date={message.received} intervalSince={previousMessage.received} />)
              </i>
            ) : null}
          </div>
          <span>
            &nbsp;
            <MessageId message={message} />
          </span>
          <div style={{ float: 'right' }}>
            <Copy value={value ?? ''} />
          </div>
        </span>
      ),
      selected: message && message === props.selected,
    }
    previousMessage = message
    return element
  })

  const value = node.message ? (decodeMessage(node.message)?.message?.format()[0] ?? null) : null

  const isMessagePlottable = isPlottable(value)
  return (
    <div>
      <History
        items={historyElements}
        contentTypeIndicator={
          isMessagePlottable ? (
            <CustomIconButton
              style={{ height: '22px', width: '22px' }}
              onClick={addNodeToCharts}
              tooltip="Add to chart panel"
            >
              <ShowChart style={{ marginTop: '-5px' }} />
            </CustomIconButton>
          ) : undefined
        }
        onClick={displayMessage}
      >
        {isMessagePlottable ? <TopicPlot node={node} history={node.messageHistory} /> : null}
      </History>
    </div>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: { charts: bindActionCreators(chartActions, dispatch) },
})

export default connect(null, mapDispatchToProps)(React.memo(MessageHistory))
