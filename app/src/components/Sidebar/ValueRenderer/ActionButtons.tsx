import React, { useCallback } from 'react'
import Code from '@mui/icons-material/Code'
import Reorder from '@mui/icons-material/Reorder'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { Tooltip } from '@mui/material'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { AppState } from '../../../reducers'
import { settingsActions } from '../../../actions'
import { ValueRendererDisplayMode } from '../../../reducers/Settings'

function ActionButtons(props: {
  actions: { settings: typeof settingsActions }
  valueRendererDisplayMode: ValueRendererDisplayMode
  classes: any
}) {
  const handleValue = useCallback(
    (mouseEvent: React.MouseEvent, value: any) => {
      if (value === null) {
        return
      }
      props.actions.settings.setValueDisplayMode(value)
    },
    [props.actions.settings.setValueDisplayMode]
  )

  return (
    <ToggleButtonGroup
      id="valueRendererDisplayMode"
      value={props.valueRendererDisplayMode}
      exclusive
      onChange={handleValue}
    >
      <ToggleButton className={props.classes.toggleButton} value="diff" id="valueRendererDisplayMode-diff">
        <Tooltip title="Show difference between the current and the last message">
          <span className={props.classes.buttonContent}>
            <Code className={props.classes.toggleButtonIcon} />
            <span className={props.classes.buttonText}>Diff</span>
          </span>
        </Tooltip>
      </ToggleButton>
      <ToggleButton className={props.classes.toggleButton} value="raw" id="valueRendererDisplayMode-raw">
        <Tooltip title="Raw / formatted JSON / formatted sparkplugb protojson">
          <span className={props.classes.buttonContent}>
            <Reorder className={props.classes.toggleButtonIcon} />
            <span className={props.classes.buttonText}>Raw</span>
          </span>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

const styles = (theme: Theme) => ({
  toggleButton: {
    height: '36px',
    padding: theme.spacing(0.5, 1.5),
  },
  toggleButtonIcon: {
    verticalAlign: 'middle',
    fontSize: '1.25rem',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  buttonText: {
    fontSize: '0.875rem',
    textTransform: 'none' as const,
  },
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    settings: bindActionCreators(settingsActions, dispatch),
  },
})

const mapStateToProps = (state: AppState) => ({
  valueRendererDisplayMode: state.settings.get('valueRendererDisplayMode'),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ActionButtons) as any)
