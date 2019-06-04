import * as diff from 'diff'
import * as React from 'react'
import ShowChart from '@material-ui/icons/ShowChart'
import { JsonPropertyLocation, literalsMappedByLines } from '../../../../../backend/src/JsonAstParser'
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
      textAlign: 'right' as 'right',
      paddingRight: theme.spacing(0.5),
    },
  }
}

function Gutters(props: Props) {
  const gutters = props.changes.map((change, key) => {
    return trimNewlineRight(change.value)
      .split('\n')
      .map((_, idx) => (
        <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={props.classes.gutterLine}>
          {change.added ? '+' : null}{change.removed ? '-' : null}{!change.added && !change.removed ? ' ' : null}
        </div>
      ))
  }).reduce((a, b) => a.concat(b), [])

  return <div>{gutters}</div>
}

export default withStyles(style)(Gutters)
