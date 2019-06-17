import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import Chart from './Chart'
import { ChartParameters } from '../../reducers/Charts'

interface Props {
  tree?: q.Tree<any>
  parameters: ChartParameters
}

export function ChartWithTreeNode(props: Props) {
  const { tree, parameters } = props
  if (!tree) {
    return null
  }

  const initialTreeNode = tree.findNode(parameters.topic)
  const [treeNode, setTreeNode] = React.useState<q.TreeNode<any> | undefined>(initialTreeNode)

  usePollingToFetchTreeNode(treeNode, tree, parameters.topic, setTreeNode)
  return <Chart treeNode={treeNode} parameters={parameters} />
}

/**
 * If a node is not available when the plot is shown, keep polling until it has been created
 */
function usePollingToFetchTreeNode(
  treeNode: q.TreeNode<any> | undefined,
  tree: q.Tree<any>,
  path: string,
  setTreeNode: React.Dispatch<React.SetStateAction<q.TreeNode<any> | undefined>>
) {
  function pollUntilTreeNodeHasBeenFound() {
    let intervalTimer: any
    if (!treeNode) {
      intervalTimer = setInterval(() => {
        const node = tree.findNode(path)
        if (node) {
          setTreeNode(node)
          clearInterval(intervalTimer)
        }
      }, 500)
    }
    return function cleanup() {
      intervalTimer && clearInterval(intervalTimer)
    }
  }

  React.useEffect(pollUntilTreeNodeHasBeenFound, [])
}
