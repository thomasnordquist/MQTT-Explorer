import * as React from "react";
import * as q from '../../../src/Model'
import ReactJson from 'react-json-view'

interface Props {
  node?: q.TreeNode | undefined
}

interface State {
  node?: q.TreeNode | undefined
}

export class ValueRenderer extends React.Component<Props, State> {
  private updateNode: (node?: q.TreeNode | undefined) => void
  constructor(props: any) {
    super(props);
    this.state = {}
    this.updateNode = (node) => {
      if (!node) {
        this.setState(this.state)
      } else {
        this.setState({node: node})
      }
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.props.node.removeListener('update', this.updateNode)
    nextProps.node && nextProps.node.on('update', this.updateNode)
    nextProps.node && this.updateNode(nextProps.node)
  }

  public render() {
    let node = this.props.node
    if (!node) {
      return null
    }

    let json
    try {
      json = JSON.parse(node.value)
    } catch(error) {
      return this.renderRawValue(node.value)
    }

    if (typeof json === 'string') {
      return this.renderRawValue(node.value)
    } else if (typeof json === 'number') {
      return this.renderRawValue(node.value)
    } else {
      return <ReactJson src={json} />
    }
  }

  private renderRawValue(value: string) {
    let style: React.CSSProperties = {
      wordBreak: 'break-all',
      width: '100%',
      overflow: 'scroll',
      display: 'block',
      lineHeight: '1.2em',
      padding: '12px 5px 12px 5px'
    }

    return <pre><code style={style}>{value}</code></pre>
  }
}
