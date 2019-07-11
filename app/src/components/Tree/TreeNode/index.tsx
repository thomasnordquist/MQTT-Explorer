import * as q from '../../../../../backend/src/Model'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TreeNodeSubnodes from './TreeNodeSubnodes'
import TreeNodeTitle from './TreeNodeTitle'
import { SettingsState } from '../../../reducers/Settings'
import { styles } from './styles'
import { Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { treeActions } from '../../../actions'
import { useAnimationToIndicateTopicUpdate } from './effects/useAnimationToIndicateTopicUpdate'
import { useDeleteKeyCallback } from './effects/useDeleteKeyCallback'
import { useIsAllowedToAutoExpandState } from './effects/useIsAllowedToAutoExpandState'
import { useViewModelSubscriptions } from './effects/useViewModelSubscriptions'

export interface Props {
  isRoot?: boolean
  treeNode: q.TreeNode<TopicViewModel>
  name?: string | undefined
  collapsed?: boolean | undefined
  classes: any
  className?: string
  lastUpdate: number
  actions: typeof treeActions
  selectTopicAction: (treeNode: q.TreeNode<any>) => void
  theme: Theme
  settings: SettingsState
}

function TreeNodeComponent(props: Props) {
  const { actions, classes, className, settings, theme, treeNode, lastUpdate, name } = props
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | undefined>(undefined)
  const [selected, setSelected] = useState(false)
  const nodeRef = useRef<HTMLDivElement>()
  const isAllowedToAutoExpand = useIsAllowedToAutoExpandState(props)
  const deleteTopicCallback = useDeleteKeyCallback(treeNode, actions)
  useViewModelSubscriptions(treeNode, nodeRef, setSelected, setCollapsedOverride)
  const animationClass =
    props.theme.palette.type === 'light' ? props.classes.animationLight : props.classes.animationDark

  useAnimationToIndicateTopicUpdate(
    nodeRef,
    lastUpdate,
    animationClass,
    selected,
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
      didSelectTopic()
      setCollapsedOverride(!isCollapsed)
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
      if (settings.get('selectTopicWithMouseOver') && treeNode && treeNode.message && treeNode.message.value) {
        didSelectTopic()
      }
    },
    [didSelectTopic]
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
      <div>
        <div
          key={treeNode.hash()}
          className={`${classes.node} ${className} ${highlightClass} ${classes.title}`}
          onMouseEnter={mouseOver}
          onFocus={didObtainFocus}
          onClick={didClickTitle}
          ref={nodeRef as any}
          tabIndex={-1}
          onKeyDown={deleteTopicCallback}
        >
          <TreeNodeTitle
            toggleCollapsed={toggleCollapsed}
            didSelectNode={didSelectTopic}
            collapsed={isCollapsed}
            treeNode={treeNode}
            name={name}
          />
        </div>
        {renderNodes()}
      </div>
    )
  }, [treeNode.lastUpdate, treeNode, name, isCollapsed, selected, theme])
}

export default withStyles(styles, { withTheme: true })(TreeNodeComponent)
