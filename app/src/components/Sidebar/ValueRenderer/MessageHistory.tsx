import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import ShowChart from '@material-ui/icons/ShowChart'
import Copy from '../../helper/Copy'
import DateFormatter from '../../helper/DateFormatter'
import History from '../HistoryDrawer'
import TopicPlot from '../../TopicPlot'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'
import { isPlottable } from '../CodeDiff/util'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../../actions'
import { connect } from 'react-redux'
import CustomIconButton from '../../helper/CustomIconButton'

const throttle = require('lodash.throttle')

interface Props {
  node?: q.TreeNode<TopicViewModel>
  selected?: q.Message
  onSelect: (message: q.Message) => void
  actions: {
    charts: typeof chartActions
  }
}

interface State {
  displayMessage?: q.Message
  anchorEl?: HTMLElement
  lastUpdate: number
}

class MessageHistory extends React.PureComponent<Props, State> {
  private updateNode = throttle(() => {
    this.setState({ lastUpdate: Date.now() })
  }, 300)

  constructor(props: any) {
    super(props)
    this.state = { lastUpdate: 0 }
  }

  private addNodeToCharts = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const { node } = this.props
    if (!node) {
      return null
    }

    this.props.actions.charts.addChart({ topic: node.path() })
  }

  private displayMessage = (index: number, eventTarget: EventTarget) => {
    const message = this.props.node && this.props.node.messageHistory.toArray().reverse()[index]
    if (message) {
      this.props.onSelect(message)
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.props.node.onMessage.unsubscribe(this.updateNode)
    nextProps.node && nextProps.node.onMessage.subscribe(this.updateNode)
  }

  public componentDidMount() {
    this.props.node && this.props.node.onMessage.subscribe(this.updateNode)
  }

  public componentWillUnMount() {
    this.props.node && this.props.node.onMessage.unsubscribe(this.updateNode)
  }

  public render() {
    const { node } = this.props
    if (!node) {
      return null
    }

    const history = node.messageHistory.toArray()
    let previousMessage: q.Message | undefined = node.message
    const historyElements = [...history].reverse().map((message, idx) => {
      const value = message.value ? Base64Message.toUnicodeString(message.value) : ''
      const element = {
        value,
        key: `${message.messageNumber}-${message.received}`,
        title: (
          <span>
            <DateFormatter date={message.received} />
            {previousMessage && previousMessage !== message ? (
              <i>
                (-
                <DateFormatter date={message.received} intervalSince={previousMessage.received} />)
              </i>
            ) : null}
            <div style={{ float: 'right' }}>
              <Copy value={value} />
            </div>
          </span>
        ),
        selected: message && message === this.props.selected,
      }
      previousMessage = message
      return element
    })

    const isMessagePlottable =
      node.message && node.message.value && isPlottable(Base64Message.toUnicodeString(node.message.value))
    return (
      <div>
        <History
          items={historyElements}
          contentTypeIndicator={
            isMessagePlottable ? (
              <CustomIconButton
                style={{ height: '22px', width: '22px' }}
                onClick={this.addNodeToCharts}
                tooltip="Add to chart panel"
              >
                <ShowChart style={{ marginTop: '-5px' }} />
              </CustomIconButton>
            ) : (
              undefined
            )
          }
          onClick={this.displayMessage}
        >
          {isMessagePlottable ? <TopicPlot history={node.messageHistory} /> : null}
        </History>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: { charts: bindActionCreators(chartActions, dispatch) },
  }
}

export default connect(
  null,
  mapDispatchToProps
)(MessageHistory)
