import * as React from 'react'
import Check from '@material-ui/icons/Check'
import CustomIconButton from './CustomIconButton'
import FileCopy from '@material-ui/icons/FileCopy'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { globalActions } from '../../actions'

const copy = require('copy-text-to-clipboard')

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

  private handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()

    copy(this.props.value ?? this.props.getValue?.())
    this.props.actions.global.showNotification('Copied to clipboard')
    this.setState({ didCopy: true })
    setTimeout(() => {
      this.setState({ didCopy: false })
    }, 1500)
  }

  public render() {
    const icon = !this.state.didCopy ? (
      <FileCopy fontSize="inherit" />
    ) : (
      <Check fontSize="inherit" style={{ cursor: 'default' }} />
    )

    return (
      <CustomIconButton onClick={this.handleClick} tooltip="Copy to clipboard">
        <div style={{ marginTop: '2px' }}>{icon}</div>
      </CustomIconButton>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      global: bindActionCreators(globalActions, dispatch),
    },
  }
}

export default connect(undefined, mapDispatchToProps)(Copy)
