import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import { default as ReactJson } from 'react-json-view'
import { withTheme, Theme } from '@material-ui/core/styles'

interface Props {
  node?: q.TreeNode | undefined
  theme: Theme
}

interface State {
  node?: q.TreeNode | undefined
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
      const theme = this.props.theme.palette.type === 'dark' ? 'monokai' : 'bright:inverted'
      return <ReactJson
        style={{ width: '100%' }}
        src={json}
        theme={theme}
        onEdit={(val) => {
          console.log(val)
        }} />
    }
  }

  private renderRawValue(value: string) {
    const style: React.CSSProperties = {
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
