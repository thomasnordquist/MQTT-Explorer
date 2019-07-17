import React, { useRef } from 'react'
import Play from '@material-ui/icons/PlayArrow'
import Pause from '@material-ui/icons/PauseCircleFilled'
import Clear from '@material-ui/icons/Clear'
import CustomIconButton from '../helper/CustomIconButton'
import { ChartParameters } from '../../reducers/Charts'
import { SettingsButton } from './ChartSettings/SettingsButton'

export function ChartActions(props: {
  paused: boolean
  togglePause: () => void
  parameters: ChartParameters
  onRemove: () => void
  resetDataAction: () => void
}) {
  const menuAnchor = useRef()
  return (
    <div style={{ display: 'flex' }}>
      <CustomIconButton tooltip={props.paused ? 'Resume chart' : 'Pause chart'} onClick={props.togglePause}>
        {props.paused ? <Play /> : <Pause />}
      </CustomIconButton>
      <SettingsButton menuAnchor={menuAnchor} parameters={props.parameters} resetDataAction={props.resetDataAction} />
      <CustomIconButton tooltip="Remove chart" onClick={props.onRemove}>
        <Clear data-test-type="RemoveChart" data-test={`${props.parameters.topic}-${props.parameters.dotPath || ''}`} />
      </CustomIconButton>
      <div style={{ width: 0, overflow: 'hidden' }}>
        {/* Helper element to provide an anchor element for the menu,
         * so the menu prefers not to overlap with the chart
         */}
        <div style={{ marginLeft: '11px' }} ref={menuAnchor as any} />
      </div>
    </div>
  )
}
