import * as React from 'react'
import { connect } from 'react-redux'
import * as q from '../../../../backend/src/Model'
import { withTheme, Theme } from '@material-ui/core/styles'
import { AppState, NodeOrder } from '../../reducers'

import TreeNode from './TreeNode'

export interface Props {
  nodeOrder?: NodeOrder
  animateChanges: boolean
  treeNode: q.TreeNode
  autoExpandLimit: number
  collapsed?: boolean | undefined
  didSelectNode?: (node: q.TreeNode) => void
  theme: Theme
}

class TreeNodeSubnodes extends React.Component<Props, {}> {
  private sortedNodes(): q.TreeNode[] {
    const { nodeOrder, treeNode } = this.props

    let edges = Object.values(treeNode.edges)
    if (nodeOrder === NodeOrder.abc) {
      edges = edges.sort((a, b) => a.name.localeCompare(b.name))
    }

    let nodes = edges.map(edge => edge.target)
    if (nodeOrder === NodeOrder.messages) {
      nodes = nodes.sort((a, b) => b.leafMessageCount() - a.leafMessageCount())
    }
    if (nodeOrder === NodeOrder.topics) {
      nodes = nodes.sort((a, b) => b.leafCount() - a.leafCount())
    }

    return nodes
  }

  public render() {
    const edges = Object.values(this.props.treeNode.edges)
    if (edges.length === 0 || this.props.collapsed) {
      return null
    }

    const listItemStyle = {
      padding: '3px 8px 0px 8px',
    }

    const nodes = this.sortedNodes()
    const listItems = nodes.map(node => (
        <div key={node.hash()} style={listItemStyle}>
          <TreeNode
            animateChages={this.props.animateChanges}
            treeNode={node}
            didSelectNode={this.props.didSelectNode}
            autoExpandLimit={this.props.autoExpandLimit}
          />
        </div>
      ))

    return (
      <span style={{ display: 'block', clear: 'both' }} >
        {this.props.collapsed ? null : listItems}
      </span>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    nodeOrder: state.settings.nodeOrder,
  }
}

export default withTheme()(connect(mapStateToProps)(TreeNodeSubnodes))
