import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Theme, withTheme } from '@material-ui/core/styles'

import History from './History'

interface Props {
  node?: q.TreeNode
  theme: Theme
}

class MessageHistory extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
  }

  private updateNode = () => {
    this.setState(this.state)
  }

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
    if (!this.props.node) {
      return null
    }
    const history = this.props.node.messageHistory.toArray()
    const historyElements = history.map(message => ({
      title: message.received.toGMTString(),
      value: message.value,
    }))

    return <History items={historyElements} />
  }
}

export default withTheme()(MessageHistory)
