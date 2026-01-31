import React from 'react'
import { Link } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as q from '../../../../backend/src/Model'
import { treeActions } from '../../actions'

interface Props {
  node?: q.TreeNode<any>
  classes: any
  actions: typeof treeActions
}

function SimpleBreadcrumb(props: Props) {
  const { node, classes, actions } = props

  if (!node) {
    return null
  }

  const branch = node.branch()
  const breadcrumbNodes = branch
    .map(n => n.sourceEdge)
    .filter(edge => Boolean(edge) && edge?.target)
    .map(edge => ({ name: edge?.name || '', target: edge!.target }))
    .filter(item => item.name !== '')

  if (breadcrumbNodes.length === 0) {
    return null
  }

  return (
    <div className={classes.breadcrumbContainer}>
      {breadcrumbNodes.map((item, index) => (
        <span key={item.target.hash()}>
          {index > 0 && <span className={classes.separator}> / </span>}
          <Link
            component="button"
            variant="h6"
            className={classes.breadcrumbLink}
            onClick={() => actions.selectTopic(item.target)}
            underline="hover"
          >
            {item.name}
          </Link>
        </span>
      ))}
    </div>
  )
}

const styles = (theme: Theme) => ({
  breadcrumbContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: 0,
  },
  breadcrumbLink: {
    fontSize: '1rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    cursor: 'pointer',
    textAlign: 'left' as const,
    border: 'none',
    background: 'none',
    padding: 0,
    lineHeight: 1.5,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  separator: {
    color: theme.palette.text.secondary,
    userSelect: 'none' as const,
  },
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(treeActions, dispatch),
})

export default connect(null, mapDispatchToProps)(withStyles(styles)(SimpleBreadcrumb))
