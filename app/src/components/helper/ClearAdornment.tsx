import * as React from 'react'
import { IconButton } from '@material-ui/core'
import Clear from '@material-ui/icons/Clear'

interface Props {
  value?: string
  action: any
  style?: React.CSSProperties
}

class ClearAdornment extends React.Component<Props, {}> {
  public render() {
    if (this.props.value) {
      return (
        <IconButton style={{ ...this.props.style, padding: '1px' }} onClick={this.props.action}>
          <Clear style={{ fontSize: '16px' }} />
        </IconButton>
      )
    }

    return null
  }
}

export default ClearAdornment
