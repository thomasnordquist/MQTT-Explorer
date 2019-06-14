import * as diff from 'diff'
import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import Add from '@material-ui/icons/Add'
import Remove from '@material-ui/icons/Remove'
import ShowChart from '@material-ui/icons/ShowChart'
import TopicPlot from '../TopicPlot'
import {
  Fade,
  Paper,
  Popper,
  Theme,
  Tooltip
  } from '@material-ui/core'
import { JsonPropertyLocation } from '../../../../../backend/src/JsonAstParser'
import { lineChangeStyle, trimNewlineRight } from './util'
import { withStyles } from '@material-ui/styles'

interface Props {
  changes: Array<diff.Change>,
  literalPositions: Array<JsonPropertyLocation>
  classes: any
  className: string
  messageHistory: q.MessageHistory
}

const style = (theme: Theme) => {
  const icon = {
    verticalAlign: 'top',
    width: '12px',
    height: '12px',
    marginTop: '2px',
    borderRadius: '50%',
  }

  return {
    icon,
    iconDisabled: {
      ...icon,
      color: theme.palette.text.disabled,
    },
    iconButton: {
      ...icon,
      width: '16px',
      height: '16px',
      padding: '2px',
      '&:hover': {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
      },
    },
    gutterLine: {
      textAlign: 'right' as 'right',
      paddingRight: theme.spacing(0.5),
      height: '16px',
      width: '100%',
    },
  }
}

function ChartIcon(props: { messageHistory: q.MessageHistory, classes: any, literal: JsonPropertyLocation }) {
  const chartIconRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  const mouseOver = React.useCallback((event: React.MouseEvent<Element>) => {
    setOpen(true)
  }, [props.literal.path])

  const mouseOut = React.useCallback(() => {
    setOpen(false)
  }, [])

  return (<span>
    <ShowChart ref={chartIconRef} className={props.classes.icon} onMouseEnter={mouseOver} onMouseLeave={mouseOut} />
    <Popper
      open={open}
      anchorEl={chartIconRef.current}
      placement="left-end"
    >
      <Fade in={open} timeout={300}>
        <Paper style={{ width: '300px' }}>
          {open ? <TopicPlot history={props.messageHistory} dotPath={props.literal.path} /> : <span/>}
        </Paper>
      </Fade>
    </Popper>
  </span>
  )
}

function tokensForLine(change: diff.Change, line: number, props: Props) {
  const { classes, literalPositions } = props
  const hasEnoughDataToDisplayDiagrams = props.messageHistory.count() > 1
  const literal = literalPositions[line]

  let chartIcon = null
  if (literal) {
    if (hasEnoughDataToDisplayDiagrams) {
      chartIcon = <ChartIcon messageHistory={props.messageHistory} classes={{ icon: props.classes.iconButton }} literal={literal} />
    } else {
      chartIcon = <Tooltip title="Not enough data"><ShowChart className={props.classes.iconDisabled} style={{ color: '#aaa' }} /></Tooltip>
    }
  }

  if (change.added) {
    return [chartIcon, <Add key="add" className={classes.icon} />]
  } else if (change.removed) {
    return [<Remove key="remove" className={classes.icon} />]
  } else {
    return [chartIcon, <div key="placeholder" style={{ width: '12px', display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: '&nbsp;' }} />]
  }
}

function Gutters(props: Props) {
  let currentLine = -1
  const gutters = props.changes.map((change, key) => {
    return trimNewlineRight(change.value)
      .split('\n')
      .map((_, idx) => {
        currentLine = !change.removed ? currentLine + 1 : currentLine
        return (
          <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={props.classes.gutterLine}>
            {tokensForLine(change, currentLine, props)}
          </div>
        )
    })
  }).reduce((a, b) => a.concat(b), [])

  return <span>
    <pre className={props.className}>{gutters}</pre>
  </span>
}

export default withStyles(style)(Gutters)
