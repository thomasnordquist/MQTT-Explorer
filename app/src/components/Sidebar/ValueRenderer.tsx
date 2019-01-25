import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Theme, withTheme } from '@material-ui/core/styles'

import { default as ReactJson } from 'react-json-view'

interface Props {
  message?: q.Message
  theme: Theme
}

class ValueRenderer extends React.Component<Props, {}> {
  public render() {
    return <div style={{ padding: '8px 0px 8px 8px' }}>{this.renderValue()}</div>
  }

  public renderValue() {
    const { message } = this.props
    if (!message) {
      return null
    }

    let json
    try {
      json = JSON.parse(message.value)
    } catch (error) {
      return this.renderRawValue(message.value)
    }

    if (typeof json === 'string') {
      return this.renderRawValue(message.value)
    } else if (typeof json === 'number') {
      return this.renderRawValue(message.value)
    } else if (typeof json === 'boolean') {
      return this.renderRawValue(message.value)
    } else {
      const theme = (this.props.theme.palette.type === 'dark') ? 'monokai' : 'bright:inverted'
      return (
        <ReactJson
          style={{ width: '100%', overflowY: 'scroll', wordBreak: 'break-all' }}
          src={json}
          name={null}
          theme={theme}
        />
      )
    }
  }

  private renderRawValue(value: string) {
    const style: React.CSSProperties = {
      padding: '8px 12px 8px 12px',
      backgroundColor: 'rgba(100, 100, 100, 0.55)',
      wordBreak: 'break-all',
      width: '100%',
      overflow: 'auto hidden',
      display: 'block',
      lineHeight: '1.2em',
      color: this.props.theme.palette.text.primary,
    }

    return <pre style={style}><code>{value}</code></pre>
  }
}

export default withTheme()(ValueRenderer)
