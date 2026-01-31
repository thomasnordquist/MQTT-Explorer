import BarChart from '@mui/icons-material/BarChart'
import Clear from '@mui/icons-material/Refresh'
import ColorLens from '@mui/icons-material/ColorLens'
import MultilineChart from '@mui/icons-material/MultilineChart'
import React, { memo } from 'react'
import Sort from '@mui/icons-material/Sort'
import { Menu, MenuItem, ListItemIcon, Typography } from '@mui/material'
import ColorSettings from './ColorSettings'
import InterpolationSettings from './InterpolationSettings'
import MoveUp from './MoveUp'
import RangeSettings from './RangeSettings'
import Size from './Size'
import TimeRangeSettings from './TimeRangeSettings'
import { ChartParameters } from '../../../reducers/Charts'

function ChartSettings(props: {
  open: boolean
  close: () => void
  resetDataAction: () => void
  chart: ChartParameters
  anchorEl: React.MutableRefObject<undefined>
}) {
  const [rangeVisible, setRangeVisible] = React.useState(false)
  const [timeRangeVisible, setTimeRangeVisible] = React.useState(false)
  const [interpolationVisible, setInterpolationVisible] = React.useState(false)
  const [sizeVisible, setSizeVisible] = React.useState(false)
  const [colorVisible, setColorVisible] = React.useState(false)
  const { open } = props

  const toggleRange = React.useCallback(() => {
    if (open) {
      props.close()
    }
    setRangeVisible(!rangeVisible)
  }, [rangeVisible, open])

  const toggleTimeRange = React.useCallback(() => {
    if (open) {
      props.close()
    }
    setTimeRangeVisible(!timeRangeVisible)
  }, [timeRangeVisible, open])

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
        <MenuItem key="range" onClick={toggleRange} data-menu-item="Y-Axis range (Values)">
          <ListItemIcon>
            <BarChart />
          </ListItemIcon>
          <Typography variant="inherit">Y-Axis range (Values)</Typography>
        </MenuItem>
        <MenuItem key="timeRange" onClick={toggleTimeRange} data-menu-item="X-Axis range (Time)">
          <ListItemIcon>
            <BarChart />
          </ListItemIcon>
          <Typography variant="inherit">X-Axis range (Time)</Typography>
        </MenuItem>
        <MenuItem key="interpolation" onClick={toggleInterpolation} data-menu-item="Curve interpolation">
          <ListItemIcon>
            <MultilineChart />
          </ListItemIcon>
          <Typography variant="inherit">Curve interpolation</Typography>
        </MenuItem>
        <MenuItem key="size" onClick={toggleSize} data-menu-item="Size">
          <ListItemIcon>
            <Sort />
          </ListItemIcon>
          <Typography variant="inherit">Size</Typography>
        </MenuItem>
        <MenuItem key="color" onClick={toggleColor} data-menu-item="Color">
          <ListItemIcon>
            <ColorLens />
          </ListItemIcon>
          <Typography variant="inherit">Color</Typography>
        </MenuItem>
        <MenuItem key="clear" onClick={props.resetDataAction} data-menu-item="Clear data">
          <ListItemIcon>
            <Clear />
          </ListItemIcon>
          <Typography variant="inherit">Clear data</Typography>
        </MenuItem>
        <MoveUp chart={props.chart} close={props.close} />
      </Menu>
      <RangeSettings chart={props.chart} anchorEl={props.anchorEl.current} open={rangeVisible} onClose={toggleRange} />
      <TimeRangeSettings
        chart={props.chart}
        anchorEl={props.anchorEl.current}
        open={timeRangeVisible}
        onClose={toggleTimeRange}
      />
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

export default memo(ChartSettings)
