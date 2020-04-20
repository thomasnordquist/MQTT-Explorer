import * as React from 'react'
import { connect } from 'react-redux'
import { AppState } from '../../../reducers'
import { bindActionCreators } from 'redux'
import { publishActions } from '../../../actions'
import { QosSelect } from '../../QosSelect'
import { QoS } from '../../../../../backend/src/DataSource/MqttSource'

interface Props {
  qos: QoS
  actions: {
    publish: typeof publishActions
  }
}

function QosPublishOption(props: Props) {
  return <QosSelect onChange={props.actions.publish.setQoS} selected={props.qos} />
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      publish: bindActionCreators(publishActions, dispatch),
    },
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    qos: state.publish.qos,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(QosPublishOption)
