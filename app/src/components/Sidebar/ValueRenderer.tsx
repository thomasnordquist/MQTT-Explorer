import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Theme, withTheme } from '@material-ui/core/styles'

import MessageHistory from './MessageHistory'
import { default as ReactJson } from 'react-json-view'

interface Props {
  node?: q.TreeNode
  theme: Theme
}

interface State {
  node?: q.TreeNode
}

class ValueRenderer extends React.Component<Props, State> {
  private updateNode: () => void
  constructor(props: any) {
    super(props)
    this.state = {}
    this.updateNode = () => {
      this.setState(this.state)
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.props.node.onMessage.unsubscribe(this.updateNode)
    nextProps.node && nextProps.node.onMessage.subscribe(this.updateNode)
  }

  public render() {
    return (
      <div style={{width: '100%'}}>
        {this.renderValue()}
        <MessageHistory node={this.props.node} />
      </div>
    )
  }

  public renderValue() {
    const node = this.props.node
    if (!node || !node.message) {
      return null
    }

    let json
    try {
      json = JSON.parse(node.message.value)
    } catch (error) {
      return this.renderRawValue(node.message.value)
    }

    if (typeof json === 'string') {
      return this.renderRawValue(node.message.value)
    } else if (typeof json === 'number') {
      return this.renderRawValue(node.message.value)
    } else if (typeof json === 'boolean') {
      return this.renderRawValue(node.message.value)
    } else {
      const theme = (this.props.theme.palette.type === 'dark') ? 'monokai' : 'bright:inverted'
      return (
        <ReactJson
          style={{ width: '100%' }}
          src={json}
          theme={theme}
        />
      )
    }
  }

  private renderRawValue(value: string) {
    const style: React.CSSProperties = {
      backgroundColor: 'rgba(80, 80, 80, 0.6)',
      wordBreak: 'break-all',
      width: '100%',
      overflow: 'scroll',
      display: 'block',
      lineHeight: '1.2em',
      padding: '12px 5px 12px 5px',
    }

    return <pre style={style}><code>{value}</code></pre>
  }
}

export default withTheme()(ValueRenderer)
