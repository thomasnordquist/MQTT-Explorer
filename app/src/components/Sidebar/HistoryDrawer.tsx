import React, { useCallback, useState, useEffect, memo } from 'react'
import { Badge, Typography } from '@mui/material'
import { Theme, emphasize } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { selectTextWithCtrlA } from '../../utils/handleTextSelectWithCtrlA'

interface HistoryItem {
  key: string
  title: JSX.Element | string
  value: string
  selected?: boolean
}

interface Props {
  items: Array<HistoryItem>
  onClick?: (index: number, element: EventTarget) => void
  classes: any
  contentTypeIndicator?: JSX.Element
  autoOpen?: boolean
  theme: Theme
  children?: any
}

function HistoryDrawer(props: Props) {
  const handleCtrlA = selectTextWithCtrlA({ targetSelector: 'pre' })
  const [expanded, setExpanded] = useState<boolean | undefined>(undefined)

  const toggle = useCallback(() => {
    setExpanded(!expanded)
  }, [expanded])

  useEffect(() => {
    if (props.autoOpen && expanded === undefined && props.items.length > 0) {
      setExpanded(true)
    }
  }, [props.autoOpen, expanded, props.items])

  const createSelectionHandler = (index: number) => (event: React.MouseEvent) => {
    props.onClick && props.onClick(index, event.target)
    event.preventDefault()
    event.stopPropagation()
  }

  function renderHistory() {
    const style = (element: HistoryItem) => ({
      backgroundColor: element.selected
        ? emphasize(props.theme.palette.background.default, 0.2)
        : emphasize(props.theme.palette.background.default, 0.07),
      margin: '8px',
      padding: '8px 8px 0 8px',
      cursor: props.onClick ? 'pointer' : 'inherit',
    })

    const messageStyle: React.CSSProperties = { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }
    const elements = props.items.map((element, index) => (
      <div
        key={element.key}
        style={style(element)}
        onClick={createSelectionHandler(index)}
        tabIndex={0}
        onKeyDown={handleCtrlA}
      >
        <div>
          <i>{element.title}</i>
        </div>
        <div style={messageStyle}>
          <span>
            <pre>{element.value}</pre>
          </span>
        </div>
      </div>
    ))

    const visible = props.items.length > 0 && !expanded

    return (
      <div className={props.classes.main}>
        <div
          style={{
            backgroundColor: emphasize(props.theme.palette.background.default, 0.07),
            borderBottom: expanded ? `1px solid ${emphasize(props.theme.palette.background.default, 0.2)}` : undefined,
          }}
        >
          <Typography component="span" onClick={toggle} style={{ cursor: 'pointer', display: 'flex' }}>
            <span style={{ flexGrow: 1 }}>
              <Badge
                classes={{ badge: props.classes.badge }}
                invisible={!visible}
                badgeContent={props.items.length}
                color="primary"
                data-testid="message-history"
              >
                {expanded ? '▼ History' : '▶ History'}
              </Badge>
            </span>
            <span>{props.contentTypeIndicator}</span>
          </Typography>
        </div>
        <div style={{ maxHeight: '230px', overflowY: 'scroll' }}>
          {expanded ? props.children : null}
          {expanded ? elements : null}
        </div>
      </div>
    )
  }

  return <div style={{ display: 'block', width: '100%' }}>{renderHistory()}</div>
}

const styles = (theme: Theme) => ({
  main: {
    backgroundColor: theme.palette.background.default,
    marginTop: '16px',
  },
  badge: { right: '-25px' },
})

export default withStyles(styles, { withTheme: true })(memo(HistoryDrawer))
