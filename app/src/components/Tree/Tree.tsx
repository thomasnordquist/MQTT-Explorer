import * as q from '../../../../backend/src/Model'
import React from 'react'
import TreeNode from './TreeNode'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { SettingsState } from '../../reducers/Settings'
import { TopicViewModel } from '../../model/TopicViewModel'
import { treeActions } from '../../actions'
import { useGlobalKeyEventHandler } from '../../effects/useGlobalKeyEventHandler'
import { KeyCodes } from '../../utils/KeyCodes'

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

function ArrowKeyHandler(props: {
  action: (direction: 'next' | 'previous') => any
  leftAction: () => void
  rightAction: () => void
}) {
  useGlobalKeyEventHandler(KeyCodes.arrow_down, () => props.action('next'), [props.action])
  useGlobalKeyEventHandler(KeyCodes.arrow_up, () => props.action('previous'), [props.action])
  useGlobalKeyEventHandler(KeyCodes.arrow_right, props.rightAction, [props.action])
  useGlobalKeyEventHandler(KeyCodes.arrow_left, props.leftAction, [props.action])
  return <div />
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
      paddingBottom: '16px', // avoid conflict with chart panel Resizer
    }

    return (
      <div style={style}>
        <ArrowKeyHandler
          action={this.props.actions.moveSelectionUpOrDownwards}
          leftAction={this.props.actions.moveOutward}
          rightAction={this.props.actions.moveInward}
        />
        <TreeNode
          key={tree.hash()}
          isRoot={true}
          treeNode={tree}
          name={this.props.host}
          collapsed={false}
          settings={this.props.settings}
          lastUpdate={tree.lastUpdate}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TreeComponent)
