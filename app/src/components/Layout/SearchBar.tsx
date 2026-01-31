import React, { useCallback, useState, useRef } from 'react'
import Search from '@mui/icons-material/Search'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { InputBase } from '@mui/material'
import { alpha as fade, Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { settingsActions } from '../../actions'
import { AppState } from '../../reducers'
import ClearAdornment from '../helper/ClearAdornment'
import { useGlobalKeyEventHandler } from '../../effects/useGlobalKeyEventHandler'
import { KeyCodes } from '../../utils/KeyCodes'

function SearchBar(props: {
  classes: any
  topicFilter?: string
  hasConnection: boolean
  actions: {
    settings: typeof settingsActions
  }
}) {
  const { actions, classes, hasConnection, topicFilter } = props

  const [hasFocus, setHasFocus] = useState(false)
  const inputRef = useRef<HTMLInputElement>()
  const onFocus = useCallback(() => {
    setHasFocus(true)
    // On mobile, switch to Topics tab when search is focused
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      if ((window as any).switchToTopicsTab) {
        ;(window as any).switchToTopicsTab()
      }
    }
  }, [])
  const onBlur = useCallback(() => setHasFocus(false), [])

  const clearFilter = useCallback(() => {
    actions.settings.filterTopics('')
  }, [])

  const onFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    actions.settings.filterTopics(event.target.value)
  }, [])

  useGlobalKeyEventHandler(undefined, event => {
    const isCharacter = event.key.length === 1
    const isModifierKey = event.metaKey || event.ctrlKey
    const isAllowedControlCharacter = event.keyCode === KeyCodes.backspace || event.keyCode === KeyCodes.delete
    const tagNameBlacklist = ['INPUT', 'TEXTAREA', 'RADIO', 'CHECKBOX', 'OPTION', 'FORM']

    const tagElementIsNotBlacklisted =
      document.activeElement && tagNameBlacklist.indexOf(document.activeElement.tagName) === -1

    if (
      (isCharacter || isAllowedControlCharacter) &&
      !isModifierKey &&
      !event.defaultPrevented &&
      !hasFocus &&
      tagElementIsNotBlacklisted &&
      hasConnection
    ) {
      // Focus input field, no preventDefault the event will reach the input element after it has been focussed
      inputRef.current && inputRef.current.focus()
    }
  })

  return (
    <div className={classes.search} role="search">
      <div className={classes.searchIcon} aria-hidden="true">
        <Search />
      </div>
      <InputBase
        value={topicFilter}
        inputProps={{
          onFocus,
          onBlur,
          ref: inputRef,
          'aria-label': 'Search topics',
        }}
        onChange={onFilterChange}
        placeholder="Search…"
        endAdornment={
          <div style={{ width: '24px', paddingRight: '8px' }}>
            <ClearAdornment variant="primary" action={clearFilter} value={topicFilter} />
          </div>
        }
        classes={{ root: classes.inputRoot, input: classes.inputInput }}
      />
    </div>
  )
}

const mapStateToProps = (state: AppState) => ({
  topicFilter: state.settings.get('topicFilter'),
  hasConnection: Boolean(state.connection.connectionId),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    settings: bindActionCreators(settingsActions, dispatch),
  },
})

const styles = (theme: Theme) => ({
  search: {
    position: 'relative' as const,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    flexGrow: 1,
    maxWidth: '60%',

    [theme.breakpoints.up('md')]: {
      maxWidth: '30%',

      marginLeft: theme.spacing(4),
      width: 'auto' as const,
    },
    [theme.breakpoints.up(750)]: {
      marginLeft: theme.spacing(4),
      width: 'auto' as const,
    },
  },
  searchIcon: {
    width: theme.spacing(6),
    height: '100%',
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  inputRoot: {
    color: `${theme.palette.common.white} !important`, // Ensure white text color with high specificity
    width: '100%',
    '& input': {
      color: `${theme.palette.common.white} !important`, // Target input element directly
    },
  },
  inputInput: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: `${theme.spacing(6)} !important`, // Ensure padding is applied (48px)
    transition: theme.transitions.create('width'),
    width: '100%',
    color: `${theme.palette.common.white} !important`, // High contrast white text with priority
    fontSize: '16px', // Prevent iOS zoom on focus
    '&::placeholder': {
      color: `${fade(theme.palette.common.white, 0.7)} !important`, // Semi-transparent white placeholder
      opacity: 1,
    },
    '&::-webkit-input-placeholder': {
      color: `${fade(theme.palette.common.white, 0.7)} !important`,
    },
    '&::-moz-placeholder': {
      color: `${fade(theme.palette.common.white, 0.7)} !important`,
    },
    // Improve mobile input handling
    [theme.breakpoints.down('md')]: {
      fontSize: '16px', // Prevent zoom
      WebkitAppearance: 'none',
      touchAction: 'manipulation',
    },
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SearchBar) as any)
