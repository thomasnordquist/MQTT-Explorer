import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { AppState } from '../../reducers'
import TreeNode from './TreeNode'
import { connect } from 'react-redux'

const MovingAverage = require('moving-average')

const timeInterval = 10 * 1000
const average = MovingAverage(timeInterval)

declare var window: any

interface Props {
  autoExpandLimit: number
  didSelectNode?: (node: q.TreeNode) => void
  connectionId?: string
  tree?: q.Tree
  filter: string
  host?: string
}

class Tree extends React.Component<Props, {}> {
  private updateTimer?: any
  private lastUpdate: number = 0
  private perf: number = 0

  constructor(props: any) {
    super(props)
    this.state = { }
  }

  public time(): number {
    const time = performance.now() - this.perf
    this.perf = performance.now()

    return time
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.tree !== nextProps.tree) {
      if (this.props.tree) {
        this.props.tree.onMerge.unsubscribe(this.throttledTreeUpdate)
      }
      if (nextProps.tree) {
        nextProps.tree.onMerge.subscribe(this.throttledTreeUpdate)
      }
      this.setState(this.state)
    }
  }

  public componentWillUnmount() {
    this.props.tree && this.props.tree.onMerge.unsubscribe(this.throttledTreeUpdate)
  }

  public throttledTreeUpdate = () => {
    if (this.updateTimer) {
      return
    }

    const expectedRenderTime = average.forecast()
    const updateInterval = Math.max(expectedRenderTime * 7, 300)
    const timeUntilNextUpdate = updateInterval - (performance.now() - this.lastUpdate)

    this.updateTimer = setTimeout(() => {
      window.requestIdleCallback(() => {
        this.lastUpdate = performance.now()
        this.updateTimer && clearTimeout(this.updateTimer)
        this.updateTimer = undefined
        this.setState(this.state)
      }, { timeout: 500 })
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
          animateChages={true}
          isRoot={true}
          treeNode={tree}
          name={this.props.host}
          lastUpdate={tree.lastUpdate}
          collapsed={false}
          performanceCallback={this.performanceCallback}
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
    autoExpandLimit: state.settings.autoExpandLimit,
    tree: state.tree.tree,
    filter: state.tree.filter,
    host: state.connection.host,
  }
}

export default connect(mapStateToProps)(Tree)
