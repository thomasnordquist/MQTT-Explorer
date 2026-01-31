import * as React from 'react'
import Check from '@mui/icons-material/Check'
import FileCopy from '@mui/icons-material/FileCopy'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import copyTextFallback from 'copy-text-to-clipboard'
import { globalActions } from '../../actions'
import CustomIconButton from './CustomIconButton'

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first (works in browser with HTTPS)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (error) {
    console.warn('Clipboard API failed, using fallback:', error)
  }

  // Fallback to copy-text-to-clipboard library
  return copyTextFallback(text)
}

interface Props {
  value?: string
  getValue?: () => string | undefined
  actions: {
    global: typeof globalActions
  }
}

interface State {
  didCopy: boolean
}

class Copy extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { didCopy: false }
  }

  private handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation()

    const text = this.props.value ?? this.props.getValue?.()
    if (!text) {
      return
    }

    const success = await copyToClipboard(text)
    if (success) {
      this.props.actions.global.showNotification('Copied to clipboard')
      this.setState({ didCopy: true })
      setTimeout(() => {
        this.setState({ didCopy: false })
      }, 1500)
    } else {
      this.props.actions.global.showNotification('Failed to copy to clipboard')
    }
  }

  public render() {
    const icon = !this.state.didCopy ? (
      <FileCopy fontSize="inherit" />
    ) : (
      <Check fontSize="inherit" style={{ cursor: 'default' }} />
    )

    return (
      <CustomIconButton onClick={this.handleClick} tooltip="Copy to clipboard" data-testid="copy-button">
        <div style={{ marginTop: '2px' }}>{icon}</div>
      </CustomIconButton>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    global: bindActionCreators(globalActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(Copy)
