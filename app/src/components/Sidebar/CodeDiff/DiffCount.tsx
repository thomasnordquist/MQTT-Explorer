import * as React from 'react'
import { Theme } from '@mui/material'
import { withStyles } from '@mui/styles'

interface Props {
  changes: Array<Diff.Change>
  classes: { [s: string]: any }
  nameOfCompareMessage: string
}

function changeAmount(props: Props) {
  // The seed is not optional: `reduce` with no initial value throws on an empty array, and
  // `changes` is empty whenever there is nothing to compare — which a decoder that returns no
  // message produces. That took down the whole app rather than rendering one empty panel.
  const additions = props.changes
    .map(change => (change.added === true ? change.count || 0 : 0))
    .reduce((a, b) => a + b, 0)
  const deletions = props.changes
    .map(change => (change.removed === true ? change.count || 0 : 0))
    .reduce((a, b) => a + b, 0)
  if (additions === 0 && deletions === 0) {
    return null
  }

  return (
    <span style={{ display: 'block', textAlign: 'right' }}>
      <span>
        Comparing with <b>{props.nameOfCompareMessage}</b> message:&nbsp;
        <span className={props.classes.additions}>
          + {additions} line
          {additions === 1 ? '' : 's'}
        </span>
        ,{' '}
        <span className={props.classes.deletions}>
          - {deletions} line
          {deletions === 1 ? '' : 's'}
        </span>
      </span>
    </span>
  )
}

const style = (theme: Theme) => ({
  additions: {
    color: 'rgb(10, 255, 10)',
  },
  deletions: {
    color: 'rgb(255, 10, 10)',
  },
})

export default withStyles(style)(changeAmount)
