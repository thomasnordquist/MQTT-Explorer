import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import TreeNode from './TreeNode'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Record } from 'immutable'
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
  filter: string
  host?: string
  paused: boolean
  settings: Record<SettingsState>
}

interface State {
  lastUpdate: number
}

class TreeComponent extends React.PureComponent<Props, State> {
  private updateTimer?: any
  private perf: number = 0
  private renderTime = 0

  constructor(props: any) {
    super(props)
    this.state = { lastUpdate: 0 }
  }

  private performanceCallback = (ms: number) => {
    average.push(Date.now(), ms)
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
      window.requestIdleCallback(
        () => {
          this.updateTimer && clearTimeout(this.updateTimer)
          this.updateTimer = undefined
          this.renderTime = performance.now()

          if (!this.props.paused) {
            this.props.tree && this.props.tree.applyUnmergedChanges()
          }
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
        <TreeNode
          key={tree.hash()}
          isRoot={true}
          treeNode={tree}
          name={this.props.host}
          collapsed={false}
          performanceCallback={this.performanceCallback}
          settings={this.props.settings}
          lastUpdate={tree.lastUpdate}
          didSelectTopic={this.props.actions.selectTopic}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TreeComponent)
