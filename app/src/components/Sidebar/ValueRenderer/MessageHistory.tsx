import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import BarChart from '@material-ui/icons/BarChart'
import DateFormatter from '../../helper/DateFormatter'
import History from '../History'
import { TopicViewModel } from '../../../TopicViewModel'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'

const PlotHistory = React.lazy(() => import('./PlotHistory'))

const throttle = require('lodash.throttle')

interface Props {
  node?: q.TreeNode<TopicViewModel>
  selected?: q.Message
  onSelect: (message: q.Message) => void
}

interface State {
  displayMessage?: q.Message,
  anchorEl?: HTMLElement
}

class MessageHistory extends React.Component<Props, State> {

  private updateNode = throttle(() => {
    this.setState(this.state)
  }, 300)
  constructor(props: any) {
    super(props)
    this.state = { }
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
    const historyElements = history.reverse().map((message) => {
      const element = {
        title: <span><DateFormatter date={message.received} /> {previousMessage ? <i>(-<DateFormatter date={message.received} intervalSince={previousMessage.received} />)</i> : null}</span>,
        value: message.value ? Base64Message.toUnicodeString(message.value) : '',
        selected: message && message === this.props.selected,
      }
      previousMessage = message
      return element
    })

    const numericMessages = history
      .map((message: q.Message) => {
        const value = message.value ? parseFloat(Base64Message.toUnicodeString(message.value)) : NaN
        return { x: message.received.getTime(), y: value  }
      }).filter(data => !isNaN(data.y))
    const showPlot = numericMessages.length >= 2

    return (
      <div>
        <History
          items={historyElements}
          contentTypeIndicator={showPlot ? <BarChart /> : undefined}
          onClick={this.displayMessage}
        >
          {showPlot ? this.renderPlot(numericMessages) : null}
        </History>
      </div>
    )
  }

  public renderPlot(data: Array<{x: number, y: number}>) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <PlotHistory data={data} />
      </React.Suspense>
    )
  }
}

export default MessageHistory
