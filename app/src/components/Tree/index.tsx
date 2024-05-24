import * as q from '../../../../backend/src/Model'
import React, { useCallback, useMemo, useRef } from 'react'
import { Infinitree } from './Infinitree'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { KeyCodes } from '../../utils/KeyCodes'
import { SettingsState } from '../../reducers/Settings'
import { TopicViewModel } from '../../model/TopicViewModel'
import { treeActions } from '../../actions'
import { FixedSizeList as List } from 'react-window'
import { useSubscription } from '../hooks/useSubscription'
const MovingAverage = require('moving-average')

const averagingTimeInterval = 10 * 1000
const average = MovingAverage(averagingTimeInterval)

declare var window: any

interface Props {
  actions: typeof treeActions
  connectionId?: string
  tree?: q.Tree<TopicViewModel>
  host?: string
  paused: boolean
  settings: SettingsState
}

function useArrowKeyEventHandler(actions: typeof treeActions) {
  return useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.keyCode) {
        case KeyCodes.arrow_down:
          actions.moveSelectionUpOrDownwards('next')
          event.preventDefault()
          break
        case KeyCodes.arrow_up:
          actions.moveSelectionUpOrDownwards('previous')
          event.preventDefault()
          break
        case KeyCodes.arrow_left:
          actions.moveOutward()
          event.preventDefault()
          break
        case KeyCodes.arrow_right:
          actions.moveInward()
          event.preventDefault()
          break
      }
    },
    [actions]
  )
}

const TreeComponent: React.FC<Props> = props => {
  const keyEventHandler = useArrowKeyEventHandler(props.actions)
  const performanceCallback = useCallback((ms: number) => {
    average.push(Date.now(), ms)
  }, [])

  const updateTimer = useRef<NodeJS.Timeout | number>()
  const perf = useRef<number>(performance.now())
  const renderTime = useRef<number>(0)
  const listRef = useRef<List>(null)
  const [lastUpdate, triggerUpdate] = React.useState(0)

  const throttledTreeUpdate = useCallback(() => {
    if (updateTimer.current) {
      return
    }

    const expectedRenderTime = average.forecast()
    const updateInterval = Math.max(expectedRenderTime * 7, 500)
    const timeUntilNextUpdate = updateInterval - (performance.now() - renderTime.current)

    updateTimer.current = setTimeout(
      () => {
        window.requestIdleCallback(
          () => {
            updateTimer.current && clearTimeout(updateTimer.current)
            updateTimer.current = undefined
            renderTime.current = performance.now()

            window.requestIdleCallback(
              () => {
                triggerUpdate(renderTime.current)
              },
              { timeout: 100 }
            )
          },
          { timeout: 500 }
        )
      },
      Math.max(0, timeUntilNextUpdate)
    )
  }, [])

  perf.current = performance.now()
  window.requestIdleCallback(() => {
    performanceCallback(performance.now() - perf.current)
  })
  const fixedOnTreeNodeRef = useRef<q.TreeNode<TopicViewModel> | null>(null)

  useSubscription(props.tree?.didUpdate, throttledTreeUpdate)

  const style: React.CSSProperties = useMemo(
    () => ({
      lineHeight: '1.1',
      cursor: 'default',
      // overflowY: 'scroll',
      // overflowX: 'hidden',
      height: '100%',
      width: '100%',
      outline: '24px black !important',
      paddingBottom: '16px', // avoid conflict with chart panel Resizer
    }),
    []
  )

  const { tree } = props
  if (!tree) {
    return null
  }

  const rendered = (
    <div style={style} tabIndex={0} onKeyDown={keyEventHandler}>
      <Infinitree
        lastUpdate={lastUpdate}
        listRef={listRef}
        key={tree.hash()}
        fixedOnTreeNodeRef={fixedOnTreeNodeRef}
        tree={tree}
        name={props.host ?? ''}
        actions={props.actions}
        selectTopicAction={props.actions.selectTopic}
        settings={props.settings}
      />
    </div>
  )

  return rendered
}

const mapStateToProps = (state: AppState) => {
  return {
    tree: state.tree.get('tree'),
    paused: state.tree.get('paused'),
    filter: state.tree.get('filter'),
    host: state.connection.host,
    settings: state.settings,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(treeActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeComponent)
