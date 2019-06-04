import * as diff from 'diff'
import * as React from 'react'
import Add from '@material-ui/icons/Add'
import Remove from '@material-ui/icons/Remove'
import ShowChart from '@material-ui/icons/ShowChart'
import { JsonPropertyLocation } from '../../../../../backend/src/JsonAstParser'
import { lineChangeStyle, trimNewlineRight } from './util'
import { Theme } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

interface Props {
  changes: Array<diff.Change>,
  literalPositions: Array<JsonPropertyLocation>
  classes: any
  className: string
  showDiagram: (dotPath: string, target: EventTarget) => void
  hideDiagram: () => void
}

const style = (theme: Theme) => {
  return {
    gutterLine: {
      textAlign: 'right' as 'right',
      paddingRight: theme.spacing(0.5),
      height: '16px',
      width: '100%',
    },
    icon: {
      width: '12px',
      height: '12px',
      marginTop: '2px',
      borderRadius: '50%',
      '&:hover': {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
      },
    },
    hover: {
      
    },
  }
}

function ChartIcon(props: { classes: any, literal: JsonPropertyLocation, showDiagram: (dotPath: string, target: EventTarget) => void, hideDiagram: () => void }) {
  const mouseOver = (event: React.MouseEvent<Element>) => {
    event.stopPropagation()
    event.preventDefault()
    if ((event.target as Element).tagName !== 'path') {
      props.showDiagram(props.literal.path, event.target)
    }
  }

  const mouseOut = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if ((event.target as Element).tagName !== 'path') {
      props.hideDiagram()
    }
  }

  return (
    <ShowChart className={props.classes.icon} onMouseEnter={mouseOver} onMouseLeave={mouseOut} />
  )
}

function tokensForLine(change: diff.Change, line: number, props: Props) {
  const { classes, literalPositions } = props

  const literal = literalPositions[line]
  const diagram = literal ? <ChartIcon classes={{ icon: props.classes.icon, hover: props.classes.hover }} literal={literal} showDiagram={props.showDiagram} hideDiagram={props.hideDiagram}/> : null

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
