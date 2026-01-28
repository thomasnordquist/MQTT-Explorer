import React from 'react'
import { Box, Typography } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

const Publish = React.lazy(() => import('./Publish/Publish'))

interface Props {
  connectionId?: string
  classes: any
}

function PublishTab(props: Props) {
  const { classes } = props

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="subtitle2" className={classes.title}>
          Publish Message
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Send messages to MQTT topics
        </Typography>
      </Box>

      <React.Suspense fallback={<div>Loading...</div>}>
        <Publish connectionId={props.connectionId} />
      </React.Suspense>
    </Box>
  )
}

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(1),
  },
  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: theme.spacing(0.5),
  },
})

export default withStyles(styles)(PublishTab)
