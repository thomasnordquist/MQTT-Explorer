import * as diff from 'diff'
import * as React from 'react'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { JsonPropertyLocation } from '../../../../../backend/src/JsonAstParser'
import { Theme } from '@mui/material'
import { withStyles } from '@mui/styles'
import * as q from '../../../../../backend/src/Model'
import { lineChangeStyle, trimNewlineRight } from './util'
import ChartPreview from './ChartPreview'

interface Props {
  changes: Array<diff.Change>
  literalPositions: Array<JsonPropertyLocation>
  classes: any
  className: string
  treeNode: q.TreeNode<any>
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
      marginTop: '0px',
      width: '16px',
      height: '16px',
      padding: '2px',
      '&:hover': {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
      },
    },
    gutterLine: {
      textAlign: 'right' as const,
      paddingRight: theme.spacing(0.5),
      height: '16px',
      width: '100%',
    },
  }
}

function tokensForLine(change: diff.Change, line: number, props: Props) {
  const { classes, literalPositions } = props
  const literal = literalPositions[line]

  const chartPreview = literal ? (
    <ChartPreview
      key="chartPreview"
      treeNode={props.treeNode}
      classes={{ icon: props.classes.iconButton }}
      literal={literal}
    />
  ) : null

  if (change.added) {
    return [chartPreview, <Add key="add" className={classes.icon} />]
  }
  if (change.removed) {
    return [<Remove key="remove" className={classes.icon} />]
  }
  return [
    chartPreview,
    <div
      key="placeholder"
      style={{ width: '12px', display: 'inline-block' }}
      dangerouslySetInnerHTML={{ __html: '&nbsp;' }}
    />,
  ]
}

function Gutters(props: Props) {
  let currentLine = -1
  const gutters = props.changes
    .map((change, key) =>
      trimNewlineRight(change.value)
        .split('\n')
        .map((_, idx) => {
          currentLine = !change.removed ? currentLine + 1 : currentLine
          return (
            <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={props.classes.gutterLine}>
              {tokensForLine(change, currentLine, props)}
            </div>
          )
        })
    )
    .reduce((a, b) => a.concat(b), [])

  return (
    <span>
      <pre className={props.className}>{gutters}</pre>
    </span>
  )
}

export default withStyles(style)(Gutters)
