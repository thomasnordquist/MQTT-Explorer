import * as React from 'react'
import { TextField, MenuItem, Tooltip } from '@material-ui/core'
import { connect } from 'react-redux'
import { AppState } from '../../../reducers'
import { bindActionCreators } from 'redux'
import { publishActions } from '../../../actions'

interface Props {
  qos: 0 | 1 | 2
  actions: {
    publish: typeof publishActions
  }
}

function QosSelect(props: Props) {
  const tooltipStyle = { textAlign: 'center' as 'center', width: '100%' }
  const itemStyle = { padding: '0' }

  const onChangeQos = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10)
      if (value !== 0 && value !== 1 && value !== 2) {
        return
      }

      props.actions.publish.setQoS(value)
    },
    [props.actions.publish]
  )

  return (
    <TextField
      select={true}
      value={props.qos}
      margin="normal"
      style={{ margin: '8px 0 8px 8px' }}
      onChange={onChangeQos}
    >
      <MenuItem key={0} value={0} style={itemStyle}>
        <Tooltip title="At most once">
          <div style={tooltipStyle}>0</div>
        </Tooltip>
      </MenuItem>
      <MenuItem key={1} value={1} style={itemStyle}>
        <Tooltip title="At least once">
          <div style={tooltipStyle}>1</div>
        </Tooltip>
      </MenuItem>
      <MenuItem key={2} value={2} style={itemStyle}>
        <Tooltip title="Exactly once">
          <div style={tooltipStyle}>2</div>
        </Tooltip>
      </MenuItem>
    </TextField>
  )
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QosSelect)
