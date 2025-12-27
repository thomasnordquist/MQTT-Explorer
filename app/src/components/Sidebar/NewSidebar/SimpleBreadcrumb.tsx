import React from 'react'
import * as q from '../../../../../backend/src/Model'
import { Typography } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

interface Props {
  node?: q.TreeNode<any>
  classes: any
}

function SimpleBreadcrumb(props: Props) {
  const { node, classes } = props
  
  if (!node) {
    return null
  }

  const breadcrumbParts = node
    .branch()
    .map(n => n.sourceEdge)
    .filter(edge => Boolean(edge))
    .map(edge => edge!.name || '')
    .filter(name => name !== '')

  if (breadcrumbParts.length === 0) {
    return null
  }

  const breadcrumbText = breadcrumbParts.join(' / ')

  return (
    <Typography variant="h6" className={classes.breadcrumb}>
      {breadcrumbText}
    </Typography>
  )
}

const styles = (theme: Theme) => ({
  breadcrumb: {
    fontSize: '1rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    wordBreak: 'break-all' as 'break-all',
    lineHeight: 1.5,
  },
})

export default withStyles(styles)(SimpleBreadcrumb)
