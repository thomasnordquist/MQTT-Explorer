import * as diff from 'diff'
import * as React from 'react'
import Add from '@material-ui/icons/Add'
import Remove from '@material-ui/icons/Remove'
import ShowChart from '@material-ui/icons/ShowChart'
import { JsonPropertyLocation } from '../../../../../backend/src/JsonAstParser'
import { lineChangeStyle, trimNewlineRight } from './util'
import { Theme, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

interface Props {
  changes: Array<diff.Change>,
  literalPositions: Array<JsonPropertyLocation>
  classes: any
  className: string
  showDiagram: (dotPath: string, target: React.Ref<HTMLElement>) => void
  hideDiagram: () => void
  hasEnoughDataToDisplayDiagrams: boolean
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
    iconButton: {
      ...icon,
      width: '16px',
      height: '16px',
      marginTop: '1px',
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

function ChartIcon(props: { classes: any, literal: JsonPropertyLocation, showDiagram: (dotPath: string, target: React.Ref<HTMLElement>) => void, hideDiagram: () => void }) {
  const chartIconRef = React.useRef(null)

  const mouseOver = React.useCallback((event: React.MouseEvent<Element>) => {
    props.showDiagram(props.literal.path, chartIconRef)
  }, [props.literal.path])

  const mouseOut = React.useCallback(() => {
    props.hideDiagram()
  }, [])

  return (
    <ShowChart ref={chartIconRef} className={props.classes.icon} onMouseEnter={mouseOver} onMouseLeave={mouseOut} />
  )
}

function tokensForLine(change: diff.Change, line: number, props: Props) {
  const { classes, literalPositions } = props

  const literal = literalPositions[line]
  const diagram = literal ? <Tooltip title="Not enough data"><ChartIcon classes={{ icon: props.classes.iconButton }} literal={literal} showDiagram={props.showDiagram} hideDiagram={props.hideDiagram}/></Tooltip> : null

  if (change.added) {
    return [diagram, <Add key="add" className={classes.icon} />]
  } else if (change.removed) {
    return [<Remove key="remove" className={classes.icon} />]
  } else {
    return [diagram, <div key="placeholder" style={{ width: '12px', display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: '&nbsp;'}} />]
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
