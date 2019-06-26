import * as q from '../../../../backend/src/Model'
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import TreeNodeSubnodes from './TreeNodeSubnodes'
import TreeNodeTitle from './TreeNodeTitle'
import { SettingsState } from '../../reducers/Settings'
import { Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../model/TopicViewModel'
import { useViewModelSubscriptions } from './useViewModelSubscriptions'
const debounce = require('lodash.debounce')

declare var performance: any

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
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(170, 170, 170, 0.55)' : 'rgba(170, 170, 170, 0.55)',
    },
    hover: {
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(100, 100, 100, 0.55)' : 'rgba(200, 200, 200, 0.55)',
    },
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

interface Props {
  isRoot?: boolean
  treeNode: q.TreeNode<TopicViewModel>
  name?: string | undefined
  collapsed?: boolean | undefined
  classes: any
  className?: string
  lastUpdate: number
  selectTopicAction: (treeNode: q.TreeNode<any>) => void
  theme: Theme
  settings: SettingsState
}

function useIsAllowedToAutoExpandState(props: Props): boolean {
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

function TreeNodeComponent(props: Props) {
  const { classes, className, settings, theme, treeNode, lastUpdate, name } = props

  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false)
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | undefined>(undefined)
  const [isHovering, setIsHovering] = useState(false)
  const [selected, setSelected] = useState(false)
  const nodeRef = useRef<HTMLDivElement>()
  const isAllowedToAutoExpand = useIsAllowedToAutoExpandState(props)
  useViewModelSubscriptions(treeNode, nodeRef, setSelected, setCollapsedOverride)
  useAnimationToIndicateTopicUpdate(lastUpdate, setShowUpdateAnimation, showUpdateAnimation)

  const isCollapsed =
    Boolean(collapsedOverride) === collapsedOverride ? Boolean(collapsedOverride) : !isAllowedToAutoExpand

  const setHover = debounce((hover: boolean) => {
    setIsHovering(hover)
  }, 45)

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
    setHover(true)
    if (settings.get('selectTopicWithMouseOver') && treeNode && treeNode.message && treeNode.message.value) {
      didSelectTopic()
    }
  }

  const mouseOut = (event: React.MouseEvent) => {
    event.stopPropagation()
    setHover(false)
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
        />
      )
    }

    const shouldStartAnimation = settings.get('highlightTopicUpdates') && showUpdateAnimation
    const animationName = theme.palette.type === 'light' ? 'updateLight' : 'updateDark'
    const animation = shouldStartAnimation
      ? { willChange: 'auto', translateZ: 0, animation: `${animationName} 0.5s` }
      : {}

    const highlightClass = selected ? classes.selected : isHovering ? classes.hover : ''
    return (
      <div>
        <div
          key={treeNode.hash()}
          className={`${classes.node} ${className} ${highlightClass} ${classes.title}`}
          style={animation}
          onMouseOver={mouseOver}
          onMouseOut={mouseOut}
          onFocus={didObtainFocus}
          onClick={didClickTitle}
          ref={nodeRef as any}
          tabIndex={-1}
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
  }, [lastUpdate, treeNode, name, isCollapsed, selected, showUpdateAnimation, isHovering])
}

export default withStyles(styles, { withTheme: true })(TreeNodeComponent)
function useAnimationToIndicateTopicUpdate(
  lastUpdate: number,
  setShowUpdateAnimation: React.Dispatch<React.SetStateAction<boolean>>,
  showUpdateAnimation: boolean
) {
  useEffect(() => {
    if (Date.now() - lastUpdate < 3000) {
      setShowUpdateAnimation(true)
    }
  }, [lastUpdate])
  useEffect(() => {
    if (showUpdateAnimation) {
      const timeout = setTimeout(() => setShowUpdateAnimation(false), 500)
      return function cleanup() {
        clearTimeout(timeout)
      }
    }
  }, [showUpdateAnimation])
}
