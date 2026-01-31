import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import * as q from '../../../../../backend/src/Model'
import TreeNodeSubnodes from './TreeNodeSubnodes'
import TreeNodeTitle from './TreeNodeTitle'
import { SettingsState } from '../../../reducers/Settings'
import { styles } from './styles'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { treeActions } from '../../../actions'
import { useAnimationToIndicateTopicUpdate } from './effects/useAnimationToIndicateTopicUpdate'
import { useDeleteKeyCallback } from './effects/useDeleteKeyCallback'
import { useIsAllowedToAutoExpandState } from './effects/useIsAllowedToAutoExpandState'
import { useViewModelSubscriptions } from './effects/useViewModelSubscriptions'
import { useSelectionState } from './effects/useSelectionState'

export interface Props {
  isRoot?: boolean
  treeNode: q.TreeNode<TopicViewModel>
  name?: string | undefined
  collapsed?: boolean | undefined
  classes: any
  lastUpdate: number
  actions: typeof treeActions
  selectTopicAction: (treeNode: q.TreeNode<any>) => void
  theme: Theme
  settings: SettingsState
}

function TreeNodeComponent(props: Props) {
  const { actions, classes, settings, theme, treeNode, lastUpdate, name } = props
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | undefined>(undefined)
  const [selected, selectionLastUpdate, setSelected] = useSelectionState(false)
  const nodeRef = useRef<HTMLDivElement>()
  const isAllowedToAutoExpand = useIsAllowedToAutoExpandState(props)
  const deleteTopicCallback = useDeleteKeyCallback(treeNode, actions)
  useViewModelSubscriptions(treeNode, nodeRef, setSelected, setCollapsedOverride)
  const animationClass =
    props.theme.palette.mode === 'light' ? props.classes.animationLight : props.classes.animationDark

  useAnimationToIndicateTopicUpdate(
    nodeRef,
    lastUpdate,
    animationClass,
    selected,
    selectionLastUpdate,
    settings.get('highlightTopicUpdates')
  )

  const isCollapsed =
    Boolean(collapsedOverride) === collapsedOverride ? Boolean(collapsedOverride) : !isAllowedToAutoExpand

  const didSelectTopic = useCallback(
    (event?: React.MouseEvent) => {
      event && event.stopPropagation()
      props.selectTopicAction(treeNode)
    },
    [treeNode]
  )

  const didClickTitle = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()

      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

      if (isMobile) {
        // Mobile: Only select the topic (no toggle)
        // Expanding is handled by the separate expand button click
        didSelectTopic()
        // Switch to details tab on mobile after selecting a topic
        if (typeof window !== 'undefined' && (window as any).switchToDetailsTab) {
          ;(window as any).switchToDetailsTab()
        }
      } else {
        // Desktop: Original behavior - select AND toggle (click anywhere works)
        didSelectTopic()
        setCollapsedOverride(!isCollapsed)
      }
    },
    [isCollapsed, didSelectTopic]
  )

  const toggleCollapsed = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      setCollapsedOverride(!isCollapsed)
    },
    [isCollapsed]
  )

  const didObtainFocus = useCallback(() => {
    didSelectTopic()
  }, [didSelectTopic])

  const mouseOver = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      if (settings.get('selectTopicWithMouseOver') && treeNode && treeNode.message && treeNode.message.payload) {
        didSelectTopic()
      }
    },
    [didSelectTopic, settings]
  )

  useEffect(() => {
    treeNode.viewModel && treeNode.viewModel.setExpanded(!isCollapsed, false)
  }, [isCollapsed])

  return useMemo(() => {
    function renderNodes() {
      if (isCollapsed) {
        return null
      }

      return (
        <TreeNodeSubnodes
          treeNode={treeNode}
          lastUpdate={treeNode.lastUpdate}
          selectTopicAction={props.selectTopicAction}
          settings={settings}
          actions={props.actions}
        />
      )
    }

    const highlightClass = selected ? classes.selected : ''
    return (
      <div className={classes.node}>
        <span
          ref={nodeRef as any}
          key={treeNode.hash()}
          className={`${classes.title} ${highlightClass}`}
          onMouseEnter={mouseOver}
          onFocus={didObtainFocus}
          onClick={didClickTitle}
          tabIndex={-1}
          onKeyDown={deleteTopicCallback}
          role="treeitem"
          aria-selected={selected}
          aria-expanded={!isCollapsed}
          aria-label={`Topic: ${name || treeNode.sourceEdge?.name || 'root'}`}
        >
          <TreeNodeTitle
            lastUpdate={treeNode.lastUpdate}
            toggleCollapsed={toggleCollapsed}
            didSelectNode={didSelectTopic}
            collapsed={isCollapsed}
            treeNode={treeNode}
            name={name}
          />
        </span>
        {renderNodes()}
      </div>
    )
  }, [treeNode.lastUpdate, treeNode, name, isCollapsed, selected, theme, mouseOver, settings])
}

export default withStyles(styles, { withTheme: true })(React.memo(TreeNodeComponent))
