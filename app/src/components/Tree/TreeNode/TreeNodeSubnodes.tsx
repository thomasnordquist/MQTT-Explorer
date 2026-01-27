import React, { useEffect, useState, useMemo } from 'react'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import * as q from '../../../../../backend/src/Model'
import TreeNode from '.'
import { SettingsState } from '../../../reducers/Settings'
import { sortedNodes } from '../../../sortedNodes'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { treeActions } from '../../../actions'

export interface Props {
  treeNode: q.TreeNode<TopicViewModel>
  filter?: string
  classes: any
  lastUpdate: number
  selectedTopic?: q.TreeNode<TopicViewModel>
  selectTopicAction: (treeNode: q.TreeNode<any>) => void
  settings: SettingsState
  actions: typeof treeActions
  theme: Theme
}

function useStagedRendering(treeNode: q.TreeNode<any>) {
  const [alreadyAdded, setAlreadyAdded] = useState(10)
  const edges = treeNode.edgeArray

  useEffect(() => {
    let renderMoreAnimationFrame: any

    if (alreadyAdded < edges.length) {
      renderMoreAnimationFrame = (window as any).requestIdleCallback(
        () => {
          setAlreadyAdded(Math.max(25, alreadyAdded * 1.5))
        },
        { timeout: 500 }
      )
    }

    return function cleanup() {
      ;(window as any).cancelIdleCallback(renderMoreAnimationFrame)
    }
  }, [alreadyAdded, edges.length])

  return alreadyAdded
}

function TreeNodeSubnodes(props: Props) {
  const alreadyAdded = useStagedRendering(props.treeNode)

  return useMemo(() => {
    const nodes = sortedNodes(props.settings, props.treeNode).slice(0, alreadyAdded)
    const listItems = nodes.map(node => (
      <TreeNode
        key={`${node.hash()}-${props.filter}`}
        treeNode={node}
        lastUpdate={node.lastUpdate}
        selectTopicAction={props.selectTopicAction}
        settings={props.settings}
        actions={props.actions}
      />
    ))

    return <span className={props.classes.list}>{listItems}</span>
  }, [alreadyAdded, props.treeNode.lastUpdate, props.theme, props.settings])
}

const styles = (theme: Theme) => ({
  list: {
    display: 'block' as const,
    clear: 'both' as const,
    marginLeft: theme.spacing(1.5),
  },
})

export default withStyles(styles, { withTheme: true })(TreeNodeSubnodes)
