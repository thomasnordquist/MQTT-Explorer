import * as React from 'react'
import Clear from '@material-ui/icons/Clear'
import { IconButton } from '@material-ui/core'

interface Props {
  value?: string
  action: any
  style?: React.CSSProperties
}

/**
 * Clear button for text input fields
 */
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
