import * as React from 'react'
import InterpolationSettings from './InterpolationSettings'
import { ChartParameters } from '../../../reducers/Charts'
import { Menu, MenuItem } from '@material-ui/core'
import RangeSettings from './RangeSettings'

function ChartSettings(props: {
  open: boolean
  close: () => void
  chart: ChartParameters
  anchorEl: React.MutableRefObject<undefined>
}) {
  const [rangeVisible, setRangeVisible] = React.useState(false)
  const [interpolationVisible, setInterpolationVisible] = React.useState(false)

  const toggleRange = React.useCallback(() => {
    if (!rangeVisible && open) {
      props.close()
    }
    setRangeVisible(!rangeVisible)
  }, [rangeVisible, open])

  const toggleInterpolation = React.useCallback(() => {
    if (!interpolationVisible && open) {
      props.close()
    }
    setInterpolationVisible(!interpolationVisible)
  }, [interpolationVisible, open])

  return (
    <span>
      <Menu id="long-menu" anchorEl={props.anchorEl.current} open={props.open} onClose={props.close}>
        <MenuItem key="range" onClick={toggleRange}>
          Set range
        </MenuItem>
        <MenuItem key="interpolation" onClick={toggleInterpolation}>
          Curve interpolation
        </MenuItem>
      </Menu>
      <RangeSettings chart={props.chart} anchorEl={props.anchorEl.current} open={rangeVisible} onClose={toggleRange} />
      <InterpolationSettings
        chart={props.chart}
        anchorEl={props.anchorEl.current}
        open={interpolationVisible}
        onClose={toggleInterpolation}
      />
    </span>
  )
}

export default ChartSettings
