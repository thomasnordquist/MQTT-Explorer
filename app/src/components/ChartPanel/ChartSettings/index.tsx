import * as React from 'react'
import InterpolationSettings from './InterpolationSettings'
import { ChartParameters } from '../../../reducers/Charts'
import { Menu, MenuItem } from '@material-ui/core'
import RangeSettings from './RangeSettings'
import Size from './Size'
import MoveUp from './MoveUp'
import ColorSettings from './ColorSettings'

function ChartSettings(props: {
  open: boolean
  close: () => void
  chart: ChartParameters
  anchorEl: React.MutableRefObject<undefined>
}) {
  const [rangeVisible, setRangeVisible] = React.useState(false)
  const [interpolationVisible, setInterpolationVisible] = React.useState(false)
  const [sizeVisible, setSizeVisible] = React.useState(false)
  const [colorVisible, setColorVisible] = React.useState(false)

  const toggleRange = React.useCallback(() => {
    if (open) {
      props.close()
    }
    setRangeVisible(!rangeVisible)
  }, [rangeVisible, open])

  const toggleInterpolation = React.useCallback(() => {
    if (open) {
      props.close()
    }
    setInterpolationVisible(!interpolationVisible)
  }, [interpolationVisible, open])

  const toggleSize = React.useCallback(() => {
    if (open) {
      props.close()
    }
    setSizeVisible(!sizeVisible)
  }, [sizeVisible, open])

  const toggleColor = React.useCallback(() => {
    if (open) {
      props.close()
    }
    setColorVisible(!colorVisible)
  }, [colorVisible, open])

  return (
    <span>
      <Menu id="long-menu" anchorEl={props.anchorEl.current} open={props.open} onClose={props.close}>
        <MenuItem key="range" onClick={toggleRange}>
          Set range
        </MenuItem>
        <MenuItem key="interpolation" onClick={toggleInterpolation}>
          Curve interpolation
        </MenuItem>
        <MenuItem key="size" onClick={toggleSize}>
          Size
        </MenuItem>
        <MenuItem key="color" onClick={toggleColor}>
          Color
        </MenuItem>
        <MoveUp chart={props.chart} close={props.close} />
      </Menu>
      <RangeSettings chart={props.chart} anchorEl={props.anchorEl.current} open={rangeVisible} onClose={toggleRange} />
      <InterpolationSettings
        chart={props.chart}
        anchorEl={props.anchorEl.current}
        open={interpolationVisible}
        close={toggleInterpolation}
      />
      <Size chart={props.chart} anchorEl={props.anchorEl.current} open={sizeVisible} close={toggleSize} />
      <ColorSettings chart={props.chart} anchorEl={props.anchorEl.current} open={colorVisible} close={toggleColor} />
    </span>
  )
}

export default ChartSettings
