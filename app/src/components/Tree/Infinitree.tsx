import * as q from '../../../../backend/src/Model'
import React, { MutableRefObject, RefObject, useCallback, useMemo, useRef } from 'react'
import { FixedSizeList as List, ListOnItemsRenderedProps, ListOnScrollProps } from 'react-window'
import { AutoSizer } from 'react-virtualized'
import TreeNode from './TreeNode'
import { TopicViewModel } from '../../model/TopicViewModel'

class TreeList {
  tree: q.TreeNode<TopicViewModel>

  constructor(tree: q.TreeNode<TopicViewModel>) {
    this.tree = tree
  }

  getVisibleChildAt(index: number): [q.TreeNode<TopicViewModel>, number] | undefined {
    return this.tree.viewModel?.visibleChildAt(index, 1)
  }

  get length(): number {
    return this.tree.viewModel?.visibleChildren() ?? 0
  }
}

const InfinitreeComponent: React.FC<{
  tree: q.TreeNode<TopicViewModel>
  actions: any
  selectTopicAction: any
  settings: any
  listRef: RefObject<List>
  lastUpdate: number
  name: string
  fixedOnTreeNodeRef: MutableRefObject<q.TreeNode<TopicViewModel> | null>
}> = ({ tree, actions, settings, listRef, fixedOnTreeNodeRef, name }) => {
  const list = useMemo(() => new TreeList(tree), [tree])
  const lastIndex = useRef<number | undefined>(0)
  const lastScroll = useRef<number>(Date.now())
  const getKey = useCallback(
    (index: number) => {
      let [treeNode] = list.getVisibleChildAt(index) ?? []

      return treeNode?.hash() ?? index.toString()
    },
    [list]
  )

  const afterRender = useCallback(
    ({ visibleStartIndex }: ListOnItemsRenderedProps) => {
      if (!visibleStartIndex) {
        return
      }

      let [treeNode] = list.getVisibleChildAt(visibleStartIndex) ?? []

      if (treeNode) {
        fixedOnTreeNodeRef.current = treeNode
      }
    },
    [list]
  )

  const indexOfItem = fixedOnTreeNodeRef.current?.viewModel?.getIndex()

  if (indexOfItem && lastIndex.current !== indexOfItem && Date.now() - lastScroll.current > 300) {
    // Kind of dangerous to mutate scroll state directly, useEffect causes glitches
    indexOfItem && listRef.current?.scrollToItem(indexOfItem, 'start')
  }
  lastIndex.current = indexOfItem

  const disableScroll = useCallback((args: ListOnScrollProps) => {
    if (!args.scrollUpdateWasRequested) {
      lastScroll.current = Date.now()
    }
  }, [])

  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          ref={listRef}
          width={width}
          height={height}
          itemSize={20}
          itemCount={list.length}
          itemKey={getKey}
          onItemsRendered={afterRender}
          onScroll={disableScroll}
          overscanCount={3}
        >
          {({ index, style }) => {
            let [treeNode, depth = 0] = list.getVisibleChildAt(index) ?? []
            if (!treeNode) {
              return null
            }

            return (
              <div style={{ ...style, paddingLeft: 12 * (depth - 1) }}>
                <TreeNode
                  treeNode={treeNode}
                  isRoot={index === 0}
                  doNotRenderSubnodes={true}
                  name={index === 0 ? name : undefined}
                  collapsed={false}
                  settings={settings}
                  lastUpdate={treeNode.lastUpdate}
                  actions={actions}
                  selectTopicAction={actions.selectTopic}
                />
              </div>
            )
          }}
        </List>
      )}
    </AutoSizer>
  )
}

export const Infinitree = InfinitreeComponent
