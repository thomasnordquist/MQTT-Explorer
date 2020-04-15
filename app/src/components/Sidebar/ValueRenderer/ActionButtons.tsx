import React, { useCallback } from 'react'
import Code from '@material-ui/icons/Code'
import Reorder from '@material-ui/icons/Reorder'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import { settingsActions } from '../../../actions'
import { Tooltip, withStyles, Theme } from '@material-ui/core'
import { bindActionCreators } from 'redux'
import { AppState } from '../../../reducers'
import { connect } from 'react-redux'
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
      exclusive={true}
      onChange={handleValue}
    >
      <ToggleButton className={props.classes.toggleButton} value="diff" id="valueRendererDisplayMode-diff">
        <Tooltip title="Show difference between the current and the last message">
          <span>
            <Code className={props.classes.toggleButtonIcon} />
          </span>
        </Tooltip>
      </ToggleButton>
      <ToggleButton className={props.classes.toggleButton} value="raw" id="valueRendererDisplayMode-raw">
        <Tooltip title="Raw / formatted JSON">
          <span>
            <Reorder className={props.classes.toggleButtonIcon} />
          </span>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

const styles = (theme: Theme) => ({
  toggleButton: {
    height: '36px',
  },
  toggleButtonIcon: {
    verticalAlign: 'middle',
  },
})

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      settings: bindActionCreators(settingsActions, dispatch),
    },
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    valueRendererDisplayMode: state.settings.get('valueRendererDisplayMode'),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ActionButtons))
