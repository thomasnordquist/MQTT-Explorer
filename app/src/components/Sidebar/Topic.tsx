import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
const copy = require('copy-text-to-clipboard')

interface Props {
  classes: any
  theme: Theme
  node?: q.TreeNode
  selected?: q.TreeNode
  didSelectNode: (node: q.TreeNode) => void
}

class Topic extends React.Component<Props, {}> {
  public static styles: StyleRulesCallback<string> = (theme: Theme) => ({
    button: {
      textTransform: 'none',
      padding: '3px 5px 3px 5px',
      minWidth: '30px',
    },
  })

  public render() {
    const { node } = this.props
    if (!node) {
      return null
    }

    let key = 0
    const breadCrumps = node.branch()
      .map(node => node.sourceEdge)
      .filter(edge => Boolean(edge))
      .map(edge =>
        [<Button
            onClick={() => this.setState({ node: edge!.target })}
            size="small"
            color="secondary"
            className={this.props.classes.button}
            key={edge!.hash()}
          >
            {edge!.name}
          </Button>],
      )

    if (breadCrumps.length === 0) {
      return null
    }

    const joinedBreadCrumps = breadCrumps.reduce((prev, current) =>
      prev.concat([<span key={key += 1}>/</span>]).concat(current),
    )

    return <span style={{ lineHeight: '2.2em' }}>
      <a onClick={() => copy(this.props.node && this.props.node.path())}>📋</a>
      {joinedBreadCrumps}
    </span>
  }
}

export default withStyles(Topic.styles, { withTheme: true })(Topic)
