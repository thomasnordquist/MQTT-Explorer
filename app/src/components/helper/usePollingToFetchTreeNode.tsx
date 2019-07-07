import * as q from '../../../../backend/src/Model'
import { useState, useEffect } from 'react'

/**
 * If a node is not available when the plot is shown, keep polling until it has been created
 */
export function usePollingToFetchTreeNode(tree: q.Tree<any> | undefined, path: string) {
  const [treeNode, setTreeNode] = useState<q.TreeNode<any> | undefined>()

  function pollUntilTreeNodeHasBeenFound() {
    if (!tree) {
      return
    }

    const initialTreeNode = tree.findNode(path)
    if (initialTreeNode) {
      setTreeNode(initialTreeNode)
      return
    }

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

  useEffect(pollUntilTreeNodeHasBeenFound, [tree])
  return treeNode
}
