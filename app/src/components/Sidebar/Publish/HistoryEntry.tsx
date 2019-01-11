import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { sidebarActions } from '../../../actions'
import { Typography } from '@material-ui/core'
import Message from './Model/Message'

interface Props {
  message: Message
  actions: any
}

class HystoryEntry extends React.Component<Props, {}> {
  public render() {
    const { message } = this.props
    return (
      <Typography onClick={this.setPublishPreset}>
        <div style={{ width: '100%', cursor: 'pointer', marginTop: '8px' }}>
          <div><b>{message.topic}</b></div>
          <div><i>{message.payload}</i></div>
        </div>
      </Typography>
    )
  }

  private setPublishPreset = (e: React.MouseEvent) => {
    e.stopPropagation()
    this.props.actions.setPublishTopic(this.props.message.topic)
    this.props.actions.setPublishPayload(this.props.message.payload)
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(sidebarActions, dispatch),
  }
}

export default connect(null, mapDispatchToProps)(HystoryEntry)
