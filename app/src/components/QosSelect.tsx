import * as React from 'react'
import { TextField, MenuItem, Tooltip } from '@mui/material'
import { QoS } from 'mqtt-explorer-backend/src/DataSource/MqttSource'

export function QosSelect(props: { selected: QoS; onChange: (value: QoS) => void; label?: string }) {
  const tooltipStyle = { textAlign: 'center' as const, width: '100%' }
  const itemStyle = { padding: '0' }

  const onChangeQos = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10)
      if (value !== 0 && value !== 1 && value !== 2) {
        return
      }
      props.onChange(value)
    },
    [props.onChange]
  )

  return (
    <TextField
      select
      label={props.label}
      value={props.selected}
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

export default React.memo(QosSelect)
