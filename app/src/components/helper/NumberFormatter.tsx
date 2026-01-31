import React from 'react'
import { connect } from 'react-redux'
import { Tooltip } from '@mui/material'
import { AppState } from '../../reducers'

function NumberFormatter(props: { locale: string; value: number; grouping?: boolean }) {
  let formatter: Intl.NumberFormat | undefined

  const formatterOptions = { useGrouping: Boolean(props.grouping) }
  const defaultFormatter = Intl.NumberFormat(undefined, formatterOptions)

  try {
    formatter = Intl.NumberFormat(props.locale, formatterOptions)
  } catch {
    // locale unknown
  }

  try {
    const formatted = (formatter || defaultFormatter).format(props.value)

    return (
      <Tooltip title={props.value}>
        <span>{formatted}</span>
      </Tooltip>
    )
  } catch {
    // localization fail, use fallback
  }

  return <span>props.value</span>
}

const mapStateToProps = (state: AppState) => ({
  locale: state.settings.get('timeLocale'),
})

export default connect(mapStateToProps)(NumberFormatter)
