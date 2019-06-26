import * as q from '../../../../../backend/src/Model'
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import TreeNodeSubnodes from './TreeNodeSubnodes'
import TreeNodeTitle from './TreeNodeTitle'
import { SettingsState } from '../../../reducers/Settings'
import { Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { useViewModelSubscriptions } from './effects/useViewModelSubscriptions'
import { treeActions } from '../../../actions'
import { lightBlue, teal, amber, green, deepPurple, blueGrey } from '@material-ui/core/colors'
import { useAnimationToIndicateTopicUpdate } from './effects/useAnimationToIndicateTopicUpdate'
import { useDeleteKeyCallback } from './effects/useDeleteKeyCallback'
import { useIsAllowedToAutoExpandState } from './effects/useIsAllowedToAutoExpandState'

const styles = (theme: Theme) => {
  return {
    collapsedSubnodes: {
      color: theme.palette.text.secondary,
    },
    displayBlock: {
      display: 'block',
    },
    node: {
      display: 'block',
      marginLeft: '10px',
      '&:hover': {
        backgroundColor: theme.palette.type === 'light' ? blueGrey[100] : theme.palette.primary.light,
      },
    },
    topicSelect: {
      float: 'right' as 'right',
      opacity: 0,
      cursor: 'pointer',
      marginTop: '-1px',
    },
    subnodes: {
      marginLeft: theme.spacing(1.5),
    },
    selected: {
      backgroundColor: (theme.palette.type === 'light' ? blueGrey[300] : theme.palette.primary.main) + ' !important',
    },
    hover: {},
    title: {
      borderRadius: '4px',
      lineHeight: '1em',
      display: 'inline-block' as 'inline-block',
      whiteSpace: 'nowrap' as 'nowrap',
      padding: '1px 4px 0px 4px',
      height: '14px',
      margin: '1px 0px 2px 0px',
    },
  }
}

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
  const deleteTopicCallback = useDeleteKeyCallback(treeNode, actions)
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false)
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | undefined>(undefined)
  const [selected, setSelected] = useState(false)
  const nodeRef = useRef<HTMLDivElement>()
  const isAllowedToAutoExpand = useIsAllowedToAutoExpandState(props)
  useViewModelSubscriptions(treeNode, nodeRef, setSelected, setCollapsedOverride)
  useAnimationToIndicateTopicUpdate(lastUpdate, selected, setShowUpdateAnimation, showUpdateAnimation)

  const isCollapsed =
    Boolean(collapsedOverride) === collapsedOverride ? Boolean(collapsedOverride) : !isAllowedToAutoExpand

  const toggle = useCallback(() => {
    setCollapsedOverride(!isCollapsed)
  }, [isCollapsed])

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
      toggle()
    },
    [toggle, didSelectTopic]
  )

  const toggleCollapsed = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      toggle()
    },
    [toggle]
  )

  const didObtainFocus = useCallback(() => {
    didSelectTopic()
  }, [didSelectTopic])

  const mouseOver = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (settings.get('selectTopicWithMouseOver') && treeNode && treeNode.message && treeNode.message.value) {
      didSelectTopic()
    }
  }

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

    const shouldStartAnimation = settings.get('highlightTopicUpdates') && showUpdateAnimation
    const animationName = theme.palette.type === 'light' ? 'updateLight' : 'updateDark'
    const animation = shouldStartAnimation
      ? { willChange: 'auto', translateZ: 0, animation: `${animationName} 0.5s` }
      : {}

    const highlightClass = selected ? classes.selected : ''
    return (
      <div>
        <div
          key={treeNode.hash()}
          className={`${classes.node} ${className} ${highlightClass} ${classes.title}`}
          style={animation}
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
  }, [lastUpdate, treeNode, name, isCollapsed, selected, theme, showUpdateAnimation])
}

export default withStyles(styles, { withTheme: true })(TreeNodeComponent)
