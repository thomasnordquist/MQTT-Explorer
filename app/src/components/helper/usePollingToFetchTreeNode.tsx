import { useState, useEffect } from 'react'
import * as q from '../../../../backend/src/Model'

/**
 * If a node is not available when the plot is shown, keep polling until it has been created
 */
export function usePollingToFetchTreeNode(tree: q.Tree<any> | undefined, path: string) {
  const [treeNode, setTreeNode] = useState<q.TreeNode<any> | undefined>()
  useEffect(() => {
    // If treeNode has been destroyed set treeNode to undefined
    if (treeNode) {
      const resetTreeNodeCallback = () => setTreeNode(undefined)
      treeNode.onDestroy.subscribe(resetTreeNodeCallback)

      return function cleanup() {
        treeNode.onDestroy.unsubscribe(resetTreeNodeCallback)
      }
    }
  }, [treeNode])

  function pollUntilTreeNodeHasBeenFound() {
    if (!tree) {
      return
    }

    const initialTreeNode = tree.findNode(path)
    if (initialTreeNode && initialTreeNode !== treeNode) {
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

  useEffect(pollUntilTreeNodeHasBeenFound, [tree, treeNode, path])
  return treeNode
}
