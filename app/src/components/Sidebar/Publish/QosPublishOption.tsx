import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { QoS } from 'mqtt-explorer-backend/src/DataSource/MqttSource'
import { AppState } from '../../../reducers'
import { publishActions } from '../../../actions'
import { QosSelect } from '../../QosSelect'

interface Props {
  qos: QoS
  actions: {
    publish: typeof publishActions
  }
}

function QosPublishOption(props: Props) {
  return <QosSelect onChange={props.actions.publish.setQoS} selected={props.qos} />
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    publish: bindActionCreators(publishActions, dispatch),
  },
})

const mapStateToProps = (state: AppState) => ({
  qos: state.publish.qos,
})

export default connect(mapStateToProps, mapDispatchToProps)(QosPublishOption)
