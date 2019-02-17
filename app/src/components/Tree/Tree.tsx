import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { AppState } from '../../reducers'
import TreeNode from './TreeNode'
import { connect } from 'react-redux'
import { TopicOrder } from '../../reducers/Settings'
import { TopicViewModel } from '../../TopicViewModel'
import { treeActions } from '../../actions'
import { bindActionCreators } from 'redux'
const ReactKeyboardEventHandler = require('react-keyboard-event-handler')

const MovingAverage = require('moving-average')

const averagingTimeInterval = 10 * 1000
const average = MovingAverage(averagingTimeInterval)

declare var window: any

interface Props {
  actions: typeof treeActions
  connectionId?: string
  tree?: q.Tree<TopicViewModel>
  filter: string
  host?: string

  topicOrder: TopicOrder
  autoExpandLimit: number
}

interface State {
  lastUpdate: number
}

class Tree extends React.PureComponent<Props, State> {
  private updateTimer?: any
  private perf: number = 0
  private renderTime = 0

  constructor(props: any) {
    super(props)
    this.state = { lastUpdate: 0 }
  }

  public time(): number {
    const time = performance.now() - this.perf
    this.perf = performance.now()

    return time
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.tree !== nextProps.tree) {
      if (this.props.tree) {
        this.props.tree.didReceive.unsubscribe(this.throttledTreeUpdate)
      }
      if (nextProps.tree) {
        nextProps.tree.didReceive.subscribe(this.throttledTreeUpdate)
      }
      this.setState(this.state)
    }
  }

  public componentWillUnmount() {
    this.props.tree && this.props.tree.didReceive.unsubscribe(this.throttledTreeUpdate)
  }

  public throttledTreeUpdate = () => {
    if (this.updateTimer) {
      return
    }

    const expectedRenderTime = average.forecast()
    const updateInterval = Math.max(expectedRenderTime * 7, 300)
    const timeUntilNextUpdate = updateInterval - (performance.now() - this.renderTime)

    this.updateTimer = setTimeout(() => {
      window.requestIdleCallback(() => {
        this.updateTimer && clearTimeout(this.updateTimer)
        this.updateTimer = undefined
        this.renderTime = performance.now()
        this.props.tree && this.props.tree.applyUnmergedChanges()
        window.requestIdleCallback(() => {
          this.setState({ lastUpdate: this.renderTime })
        }, { timeout: 100 })
      }, { timeout: 500 })
    }, Math.max(0, timeUntilNextUpdate))
  }

  private handleKeyEvent = (key: string, event: any) => {
    event.stopPropagation()
    event.preventDefault()
    this.props.actions.handleKeyEvent(key)
  }

  public render() {
    const { tree, filter } = this.props
    if (!tree) {
      return null
    }

    const style: React.CSSProperties = {
      lineHeight: '1.1',
      cursor: 'default',
    }

    return (
      <div style={style}>
        <ReactKeyboardEventHandler
          isExclusive={true}
          handleKeys={['space', 'enter', 'delete', 'backspace', 'left', 'up', 'down', 'right']}
          onKeyEvent={this.handleKeyEvent}
        />
        <TreeNode
          key={tree.hash()}
          animateChages={true}
          isRoot={true}
          treeNode={tree}
          name={this.props.host}
          collapsed={false}
          performanceCallback={this.performanceCallback}
          autoExpandLimit={this.props.autoExpandLimit}
          topicOrder={this.props.topicOrder}
          lastUpdate={tree.lastUpdate}
          didSelectTopic={this.props.actions.selectTopic}
        />
      </div>
    )
  }

  private performanceCallback = (ms: number) => {
    average.push(Date.now(), ms)
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    tree: state.tree.tree,
    filter: state.tree.filter,
    host: state.connection.host,
    autoExpandLimit: state.settings.autoExpandLimit,
    topicOrder: state.settings.topicOrder,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(treeActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tree)
