import { useEffect, useState } from 'react'
import { Props } from '..'

export function useIsAllowedToAutoExpandState(props: Props): boolean {
  const { settings, treeNode, isRoot } = props
  const [isAllowedToAutoExpand, setAllowAutoExpand] = useState(false)

  useEffect(() => {
    const newIsAllowedToAutoExpand = isRoot || treeNode.edgeCount() <= settings.get('autoExpandLimit')
    if (newIsAllowedToAutoExpand !== isAllowedToAutoExpand) {
      setAllowAutoExpand(newIsAllowedToAutoExpand)
    }
  }, [treeNode.edgeCount(), settings.get('autoExpandLimit')])
  return isAllowedToAutoExpand
}
