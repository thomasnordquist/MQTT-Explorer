import * as React from 'react'
import { Typography } from '@mui/material'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { ChartParameters } from '../../reducers/Charts'

function ChartTitle(props: { parameters: ChartParameters; classes: any }) {
  const { classes, parameters } = props
  return (
    <div style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
      <Typography variant="caption" className={classes.topic}>
        {parameters.dotPath ? parameters.dotPath : parameters.topic}
      </Typography>
      <br />
      <Typography variant="caption" className={classes.topic}>
        {parameters.dotPath ? parameters.topic : <span dangerouslySetInnerHTML={{ __html: '&nbsp;' }} />}
      </Typography>
    </div>
  )
}

const styles = (theme: Theme) => ({
  topic: {
    wordBreak: 'break-all' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
})

export default withStyles(styles)(ChartTitle)
