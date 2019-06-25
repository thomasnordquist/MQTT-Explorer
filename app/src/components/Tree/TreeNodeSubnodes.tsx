import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import TreeNode from './TreeNode'
import { SettingsState } from '../../reducers/Settings'
import { sortedNodes } from '../../sortedNodes'
import { Theme, withStyles } from '@material-ui/core'
import { TopicViewModel } from '../../model/TopicViewModel'

export interface Props {
  treeNode: q.TreeNode<TopicViewModel>
  filter?: string
  classes: any
  lastUpdate: number
  selectedTopic?: q.TreeNode<TopicViewModel>
  selectTopicAction: (treeNode: q.TreeNode<any>) => void
  settings: SettingsState
}

interface State {
  alreadyAdded: number
}

class TreeNodeSubnodes extends React.Component<Props, State> {
  private renderMoreAnimationFrame?: any
  constructor(props: Props) {
    super(props)
    this.state = { alreadyAdded: 10 }
  }

  private renderMore() {
    this.renderMoreAnimationFrame = (window as any).requestIdleCallback(
      () => {
        this.setState({ ...this.state, alreadyAdded: this.state.alreadyAdded * 1.5 })
      },
      { timeout: 500 }
    )
  }

  public componentWillUnmount() {
    ;(window as any).cancelIdleCallback(this.renderMoreAnimationFrame)
  }

  public render() {
    const edges = this.props.treeNode.edgeArray
    if (edges.length === 0) {
      return null
    }

    if (this.state.alreadyAdded < edges.length) {
      this.renderMore()
    }

    const nodes = sortedNodes(this.props.settings, this.props.treeNode).slice(0, this.state.alreadyAdded)
    const listItems = nodes.map(node => {
      return (
        <TreeNode
          key={`${node.hash()}-${this.props.filter}`}
          treeNode={node}
          className={this.props.classes.listItem}
          lastUpdate={node.lastUpdate}
          selectTopicAction={this.props.selectTopicAction}
          settings={this.props.settings}
        />
      )
    })

    return <span className={this.props.classes.list}>{listItems}</span>
  }
}

const styles = (theme: Theme) => ({
  list: {
    display: 'block' as 'block',
    clear: 'both' as 'both',
    marginLeft: theme.spacing(1.5),
  },
})

export default withStyles(styles)(TreeNodeSubnodes)
