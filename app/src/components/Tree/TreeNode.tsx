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
    const newIsAllowedToAutoExpand = !(treeNode.edgeCount() > settings.get('autoExpandLimit'))
    if (!isRoot && newIsAllowedToAutoExpand !== isAllowedToAutoExpand) {
      setAllowAutoExpand(newIsAllowedToAutoExpand)
    }
  }, [treeNode.edgeCount(), settings.get('autoExpandLimit')])

  return isAllowedToAutoExpand
}

function TreeNodeComponent(props: Props) {
  const { classes, className, settings, theme, treeNode, lastUpdate } = props

  const [animationDirty, setAnimationDirty] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean | undefined>(props.collapsed)
  const [cssAnimationWasSetAt, setCssAnimationWasSetAt] = useState(0)
  const [willUpdateTime, setWillUpdateTime] = useState(performance.now())
  const [isHovering, setIsHovering] = useState(false)
  const [selected, setSelected] = useState(false)
  const nodeRef = useRef<HTMLDivElement>()
  const isAllowedToAutoExpand = useIsAllowedToAutoExpandState(props)
  useViewModelSubscriptions(treeNode, nodeRef, setSelected, setCollapsed)

  const setHover = debounce((hover: boolean) => {
    setIsHovering(hover)
  }, 45)

  const toggle = useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])

  const didSelectTopic = useCallback(
    (event?: React.MouseEvent) => {
      console.log('Did select', treeNode.path())
      console.log(event)
      event && event.stopPropagation()
      props.selectTopicAction(treeNode)
    },
    [treeNode]
  )

  const didClickTitle = (event: React.MouseEvent) => {
    event.stopPropagation()
    didSelectTopic()
    toggle()
  }

  const didObtainFocus = useCallback(() => {
    didSelectTopic()
  }, [])

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

  const toggleCollapsed = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      toggle()
    },
    [toggle]
  )

  useEffect(() => {
    treeNode.viewModel && treeNode.viewModel.setExpanded(!collapsed, false)
  }, [collapsed])

  return useMemo(() => {
    const shouldBeRenderedCollapsed = Boolean(collapsed) === collapsed ? Boolean(collapsed) : !isAllowedToAutoExpand

    function renderNodes() {
      if (shouldBeRenderedCollapsed) {
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

    const shouldStartAnimation = settings.get('highlightTopicUpdates')
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
          onClick={didClickTitle}
          onFocus={didObtainFocus}
          ref={nodeRef as any}
          tabIndex={1000}
        >
          <TreeNodeTitle
            toggleCollapsed={toggleCollapsed}
            didSelectNode={didSelectTopic}
            collapsed={shouldBeRenderedCollapsed}
            treeNode={treeNode}
            name={name}
          />
        </div>
        {renderNodes()}
      </div>
    )
  }, [lastUpdate, treeNode, collapsed, selected, isAllowedToAutoExpand, isHovering])
}

export default withStyles(styles, { withTheme: true })(TreeNodeComponent)
