import * as React from 'react'
import ChartSettings from '.'
import CustomIconButton from '../../helper/CustomIconButton'
import MoreVertIcon from '@material-ui/icons/Settings'
import { ChartParameters } from '../../../reducers/Charts'

export function SettingsButton(props: { parameters: ChartParameters }) {
  const [visible, setVisible] = React.useState(false)
  const settingsRef = React.useRef()
  const toggleSettings = React.useCallback(() => {
    setVisible(!visible)
  }, [visible])

  const close = React.useCallback(() => {
    setVisible(false)
  }, [])

  return (
    <span>
      <ChartSettings open={visible} close={close} anchorEl={settingsRef} chart={props.parameters} />
      <CustomIconButton tooltip="Chart settings" onClick={toggleSettings}>
        <MoreVertIcon
          ref={settingsRef as any}
          data-test-type="ChartSettings"
          data-test={`${props.parameters.topic}-${props.parameters.dotPath || ''}`}
        />
      </CustomIconButton>
    </span>
  )
}
