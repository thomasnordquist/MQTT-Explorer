import * as React from 'react'
import DateFormatter from '../helper/DateFormatter'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Input, InputLabel, MenuItem, Select, StyleRulesCallback, Theme } from '@material-ui/core'
import { settingsActions } from '../../actions'
import { withStyles } from '@material-ui/styles'
import * as moment from 'moment'

interface Props {
  actions: {
    settings: typeof settingsActions
  }
  timeLocale: string
  classes: any
}

function TimeLocaleSettings(props: Props) {
  const { classes, timeLocale, actions } = props
  const locales = moment.locales()
  const date = new Date()
  const localeMenuItems = locales.map((l: string) => (
    <MenuItem key={l} value={l}>
      <div>
        Locale: <b>{l}</b>, Format:{' '}
        <b>
          <DateFormatter date={date} overrideLocale={l} />
        </b>
      </div>
    </MenuItem>
  ))

  function updateLocale(e: React.ChangeEvent<{ value: unknown }>) {
    const locale = e.target.value ? String(e.target.value) : ''
    actions.settings.setTimeLocale(locale)
  }

  return (
    <div style={{ padding: '8px', display: 'flex' }}>
      <InputLabel htmlFor="time-locale" style={{ flex: '1', marginTop: '8px' }}>
        Time Locale
      </InputLabel>
      <Select
        value={timeLocale}
        onChange={updateLocale}
        input={<Input name="time-locale" id="time-locale-label-placeholder" />}
        name="time-locale"
        className={classes.input}
        renderValue={v => <span>{String(v)}</span>}
        style={{ flex: '1' }}
      >
        {localeMenuItems}
      </Select>
    </div>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    timeLocale: state.settings.get('timeLocale'),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      settings: bindActionCreators(settingsActions, dispatch),
    },
  }
}

const styles = (theme: Theme) => ({
  input: {
    minWidth: '150px',
    margin: `auto ${theme.spacing(1)} auto ${theme.spacing(2)}px`,
  },
  selected: {
    '& div': {
      display: 'none',
    },
  },
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(TimeLocaleSettings))
