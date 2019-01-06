import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import { withTheme, Theme } from '@material-ui/core/styles'
import { isElementInViewport } from '../helper/isElementInViewport'
import TreeNodeTitle from './TreeNodeTitle'
import TreeNodeSubnodes from './TreeNodeSubnodes'

declare var performance: any

export interface TreeNodeProps {
  animateChages: boolean
  isRoot?: boolean
  treeNode: q.TreeNode
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  didSelectNode?: (node: q.TreeNode) => void
  theme: Theme
  autoExpandLimit: number
}

interface TreeNodeState {
  title: string | undefined
  collapsed: boolean
  collapsedOverride: boolean | undefined
  edgeCount: number
}

class TreeNode extends React.Component<TreeNodeProps, TreeNodeState> {
  private dirtySubnodes: boolean = true
  private dirtyState: boolean = true
  private dirtyEdges: boolean = true
  private dirtyMessage: boolean = true

  private cssAnimationWasSetAt?: number

  private willUpdateTime: number = performance.now()
  private titleRef = React.createRef<HTMLDivElement>()

  private subnodesDidchange = () => {
    this.dirtySubnodes = true
  }

  private messageDidChange = () => {
    this.dirtyMessage = true
  }

  private edgesDidChange = () => {
    this.dirtyMessage = true
  }

  constructor(props: TreeNodeProps) {
    super(props)
    const edgeCount = Object.keys(props.treeNode.edges).length
    const collapsed = edgeCount > this.props.autoExpandLimit
    this.state = { collapsed, edgeCount, collapsedOverride: props.collapsed, title: props.name }
  }

  public componentDidMount() {
    const { treeNode } = this.props
    treeNode.onMerge.subscribe(this.subnodesDidchange)
    treeNode.onEdgesChange.subscribe(this.edgesDidChange)
    treeNode.onMessage.subscribe(this.messageDidChange)
  }

  public componentWillUnmount() {
    const { treeNode } = this.props
    treeNode.onMerge.unsubscribe(this.subnodesDidchange)
    treeNode.onEdgesChange.unsubscribe(this.edgesDidChange)
    treeNode.onMessage.unsubscribe(this.messageDidChange)
  }

  private getStyles() {
    return {
      collapsedSubnodes: {
        color: this.props.theme.palette.text.secondary,
      },
      displayBlock: {
        display: 'block',
      },
    }
  }

  public setState(newState: any) {
    this.dirtyState = this.stateHasChanged(newState)

    super.setState(newState)
  }

  private stateHasChanged(newState: any) {
    return this.state.collapsed !== newState.collapsed
      || this.state.collapsedOverride !== newState.collapsedOverride
      || this.state.edgeCount !== newState.edgeCount
  }

  public shouldComponentUpdate() {
    const shouldRenderToRemoveCssAnimation = this.cssAnimationWasSetAt !== undefined
    return this.dirtyState
      || this.dirtyEdges
      || this.dirtyMessage
      || this.dirtySubnodes
      || shouldRenderToRemoveCssAnimation
  }

  public componentDidUpdate() {
    if (this.props.performanceCallback) {
      const renderTime = performance.now() - this.willUpdateTime
      this.props.performanceCallback(renderTime)
    }
  }

  public componentWillUpdate() {
    if (this.props.performanceCallback) {
      this.willUpdateTime = performance.now()
    }
  }

  private toggle() {
    this.setState({ collapsedOverride: !this.collapsed() })
  }

  private collapsed() {
    if (this.state.collapsedOverride !== undefined) {
      return this.state.collapsedOverride
    }

    return this.state.collapsed
  }

  public componentWillReceiveProps() {
    const edgeCount = Object.keys(this.props.treeNode.edges).length
    this.setState({ edgeCount, collapsed: edgeCount > this.props.autoExpandLimit })
  }

  public render() {
    const { displayBlock } = this.getStyles()
    const animationStyle = this.indicatingChangeAnimationStyle()

    this.dirtyState = this.dirtyEdges = this.dirtyMessage = this.dirtySubnodes = false

    return <div key={this.props.treeNode.hash()} style={ displayBlock }>
      <div style={animationStyle} ref={this.titleRef} onClick={() => this.toggle()}>
        <TreeNodeTitle
          edgeCount={this.state.edgeCount}
          collapsed={this.collapsed()}
          treeNode={this.props.treeNode}
          name={this.props.name}
          didSelectNode={this.props.didSelectNode}
          toggleCollapsed={() => this.toggle()}
        />
      </div>

      { this.clear() }
      <div style = { displayBlock }>
        {this.renderNodes()}
      </div>
    </div>
  }

  private clear() {
    return <div style={{ clear: 'both' }} />
  }

  private renderNodes() {
    return <TreeNodeSubnodes
      animateChanges={this.props.animateChages}
      collapsed={this.collapsed()}
      autoExpandLimit={this.props.autoExpandLimit}
      didSelectNode={this.props.didSelectNode}
      toggleCollapsed={() => this.toggle()}
      treeNode={this.props.treeNode}
    />
  }

  private indicatingChangeAnimationStyle() {
    if (this.props.isRoot) {
      return {}
    }
    if (this.cssAnimationWasSetAt && (performance.now() - this.cssAnimationWasSetAt) > 500) {
      this.cssAnimationWasSetAt = undefined
      return {}
    }
    const isInViewPort = this.titleRef.current && isElementInViewport(this.titleRef.current)
    const isDirty = this.dirtyMessage || this.dirtyEdges || this.collapsed()
    if (this.props.animateChages && isDirty && isInViewPort) {
      if (!this.cssAnimationWasSetAt) {
        this.cssAnimationWasSetAt = performance.now()
      }
      return { animation: 'example 0.5s' }
    }
  }
}

export default withTheme()(TreeNode)
