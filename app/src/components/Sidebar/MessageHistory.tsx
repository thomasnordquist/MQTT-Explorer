import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Theme, withTheme } from '@material-ui/core/styles'
import BarChart from '@material-ui/icons/BarChart'
import DateFormatter from '../DateFormatter'
import History from './History'
import PlotHistory from './PlotHistory'

const throttle = require('lodash.throttle')

interface Props {
  node?: q.TreeNode
  theme: Theme
  onSelect: (message: q.Message) => void
}

interface State {
  displayMessage?: q.Message,
  anchorEl?: HTMLElement
}

class MessageHistory extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { }
  }

  private updateNode = throttle(() => {
    this.setState(this.state)
  }, 300)

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.props.node.onMessage.unsubscribe(this.updateNode)
    nextProps.node && nextProps.node.onMessage.subscribe(this.updateNode)
  }

  public componentWillMount() {
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
    const historyElements = history.reverse().map(message => ({
      title: <DateFormatter date={message.received} />,
      value: message.value,
    }))

    const numericMessages = history.filter(message => !isNaN(parseFloat(message.value)))
    const showPlot = numericMessages.length >= 2

    return (
      <div>
        <History
          items={historyElements}
          contentTypeIndicator={showPlot ? <BarChart /> : null}
          onClick={this.displayMessage}
        >
          {showPlot ? this.renderPlot(numericMessages) : null}
        </History>
      </div>
    )
  }

  public renderPlot(numericMessages: q.Message[]) {
    return <PlotHistory messages={numericMessages} />
  }

  private displayMessage = (index: number, eventTarget: EventTarget) => {
    const message = this.props.node && this.props.node.messageHistory.toArray()[index]
    this.props.onSelect(message)
  }
}

export default withTheme()(MessageHistory)
