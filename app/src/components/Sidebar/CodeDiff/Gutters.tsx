import * as diff from 'diff'
import * as React from 'react'
import ShowChart from '@material-ui/icons/ShowChart'
import { JsonPropertyLocation } from '../../../../../backend/src/JsonAstParser'
import { lineChangeStyle, trimNewlineRight } from './util'
import { Theme } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

interface Props {
  changes: Array<diff.Change>,
  literalPositions: Array<JsonPropertyLocation>
  classes: any
}

const style = (theme: Theme) => {
  return {
    gutterLine: {
      display: 'flex' as 'flex',
      textAlign: 'right' as 'right',
      paddingRight: theme.spacing(0.5),
      height: '16px',
    },
  }
}

function tokensForLine(change: diff.Change, line: number, literalPositions: Array<JsonPropertyLocation>) {
  let diagram = literalPositions[line] ? <ShowChart style={{ height: '16px' }} /> : ''

  if (change.added) {
    return [diagram, '+']
  } else if (change.removed) {
    return '-'
  } else {
    return [diagram, ' ']
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
            {tokensForLine(change, currentLine, props.literalPositions)}
          </div>
        )
    })
  }).reduce((a, b) => a.concat(b), [])

  return <div>{gutters}</div>
}

export default withStyles(style)(Gutters)
