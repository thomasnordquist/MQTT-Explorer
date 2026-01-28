import { useEffect, useState } from 'react'
import * as q from '../../../../backend/src/Model'

export function useUpdateComponentWhenNodeUpdates(node?: q.TreeNode<any>): number {
  const [lastUpdate, setLastUpdate] = useState(0)
  useEffect(() => {
    if (!node) {
      return
    }
    const updateComponent = () => setLastUpdate(Date.now())
    node.onMerge.subscribe(updateComponent)
    return function cleanup() {
      node.onMerge.unsubscribe(updateComponent)
    }
  }, [node])
  return lastUpdate
}
