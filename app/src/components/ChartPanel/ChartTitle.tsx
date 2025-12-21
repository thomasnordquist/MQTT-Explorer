import * as React from 'react'
import { ChartParameters } from '../../reducers/Charts'
import { Typography } from '@mui/material'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

function ChartTitle(props: { parameters: ChartParameters; classes: any }) {
  const { classes, parameters } = props
  return (
    <div style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
      <Typography variant="caption" className={classes.topic}>
        {parameters.dotPath ? parameters.dotPath : parameters.topic}
      </Typography>
      <br />
      <Typography variant="caption" className={classes.topic}>
        {parameters.dotPath ? parameters.topic : <span dangerouslySetInnerHTML={{ __html: '&nbsp;' }}></span>}
      </Typography>
    </div>
  )
}

const styles = (theme: Theme) => ({
  topic: {
    wordBreak: 'break-all' as 'break-all',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    textOverflow: 'ellipsis' as 'ellipsis',
  },
})

export default withStyles(styles)(ChartTitle)
