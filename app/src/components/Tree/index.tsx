import * as q from '../../../../backend/src/Model'
import React from 'react'
import TreeNode from './TreeNode'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { KeyCodes } from '../../utils/KeyCodes'
import { SettingsState } from '../../reducers/Settings'
import { TopicViewModel } from '../../model/TopicViewModel'
import { treeActions } from '../../actions'
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

interface State {
  lastUpdate: number
}

function useArrowKeyEventHandler(actions: typeof treeActions) {
  return (event: React.KeyboardEvent) => {
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
  }
}

class TreeComponent extends React.PureComponent<Props, State> {
  private updateTimer?: any
  private perf: number = 0
  private renderTime = 0

  constructor(props: any) {
    super(props)
    this.state = { lastUpdate: 0 }
  }

  private keyEventHandler = useArrowKeyEventHandler(this.props.actions)
  private performanceCallback = (ms: number) => {
    average.push(Date.now(), ms)
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.tree !== nextProps.tree) {
      if (this.props.tree) {
        this.props.tree.didUpdate.unsubscribe(this.throttledTreeUpdate)
      }
      if (nextProps.tree) {
        nextProps.tree.didUpdate.subscribe(this.throttledTreeUpdate)
      }
      this.setState(this.state)
    }
  }

  public componentWillUnmount() {
    this.props.tree && this.props.tree.didUpdate.unsubscribe(this.throttledTreeUpdate)
  }

  public throttledTreeUpdate = () => {
    if (this.updateTimer) {
      return
    }

    const expectedRenderTime = average.forecast()
    const updateInterval = Math.max(expectedRenderTime * 7, 300)
    const timeUntilNextUpdate = updateInterval - (performance.now() - this.renderTime)

    this.updateTimer = setTimeout(() => {
      window.requestIdleCallback(
        () => {
          this.updateTimer && clearTimeout(this.updateTimer)
          this.updateTimer = undefined
          this.renderTime = performance.now()

          window.requestIdleCallback(
            () => {
              this.setState({ lastUpdate: this.renderTime })
            },
            { timeout: 100 }
          )
        },
        { timeout: 500 }
      )
    }, Math.max(0, timeUntilNextUpdate))
  }

  public componentWillUpdate() {
    this.perf = performance.now()
  }

  public componentDidUpdate() {
    this.performanceCallback(performance.now() - this.perf)
  }

  public render() {
    const { tree } = this.props
    if (!tree) {
      return null
    }

    const style: React.CSSProperties = {
      lineHeight: '1.1',
      cursor: 'default',
      overflowY: 'scroll',
      overflowX: 'hidden',
      height: '100%',
      width: '100%',
      outline: '24px black !important',
      paddingBottom: '16px', // avoid conflict with chart panel Resizer
    }

    return (
      <div style={style} tabIndex={0} onKeyDown={this.keyEventHandler}>
        <TreeNode
          key={tree.hash()}
          isRoot={true}
          treeNode={tree}
          name={this.props.host}
          collapsed={false}
          settings={this.props.settings}
          lastUpdate={tree.lastUpdate}
          actions={this.props.actions}
          selectTopicAction={this.props.actions.selectTopic}
        />
      </div>
    )
  }
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
