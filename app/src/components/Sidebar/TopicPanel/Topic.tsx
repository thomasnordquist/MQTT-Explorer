import React from 'react'
import Button from '@mui/material/Button'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as q from '../../../../../backend/src/Model'
import { treeActions } from '../../../actions'
import { TopicViewModel } from '../../../model/TopicViewModel'

interface Props {
  classes: any
  theme: Theme
  node?: q.TreeNode<TopicViewModel>
  selected?: q.TreeNode<TopicViewModel>
  actions: typeof treeActions
}

const styles = (theme: Theme) => ({
  button: {
    textTransform: 'none' as const,
    padding: '3px 5px 3px 5px',
    minWidth: '30px',
  },
})

class Topic extends React.PureComponent<Props, {}> {
  public render() {
    const { node, theme } = this.props
    if (!node) {
      return null
    }

    let key = 0
    const breadCrumps = node
      .branch()
      .map(node => node.sourceEdge)
      .filter(edge => Boolean(edge))
      .map(edge => [
        <Button
          onClick={() => this.props.actions.selectTopic(edge!.target)}
          size="small"
          variant={theme.palette.mode === 'light' ? 'contained' : undefined}
          color={theme.palette.mode === 'light' ? 'primary' : 'secondary'}
          className={this.props.classes.button}
          key={edge!.hash()}
        >
          {edge!.name || <span dangerouslySetInnerHTML={{ __html: '&nbsp;' }} />}
        </Button>,
      ])

    if (breadCrumps.length === 0) {
      return null
    }

    const joinedBreadCrumps = breadCrumps.reduce((prev, current) =>
      prev.concat([<span key={(key += 1)}> / </span>]).concat(current)
    )

    return <span style={{ lineHeight: '2.2em' }}>{joinedBreadCrumps}</span>
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(treeActions, dispatch),
})

export default connect(null, mapDispatchToProps)(withStyles(styles, { withTheme: true })(Topic) as any)
