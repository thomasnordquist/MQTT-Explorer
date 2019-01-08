import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import { withStyles, Theme } from '@material-ui/core/styles'

import { isElementInViewport } from '../helper/isElementInViewport'
import TreeNodeTitle from './TreeNodeTitle'
import TreeNodeSubnodes from './TreeNodeSubnodes'

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
    hover: {
      '&:hover': {
        backgroundColor: 'rgba(80, 80, 80, 0.35)',
      },
    },
  }
}

interface Props {
  animateChages: boolean
  isRoot?: boolean
  treeNode: q.TreeNode
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  didSelectNode?: (node: q.TreeNode) => void
  classes: any
  autoExpandLimit: number
}

interface State {
  collapsedOverride: boolean | undefined
}

class TreeNode extends React.Component<Props, State> {
  private dirtySubnodes: boolean = true
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

  constructor(props: Props) {
    super(props)

    this.state = {
      collapsedOverride: props.collapsed,
    }
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

  private stateHasChanged(newState: State) {
    return this.state.collapsedOverride !== newState.collapsedOverride
  }

  private propsHasChanged(newProps: Props) {
    return this.props.autoExpandLimit !== newProps.autoExpandLimit
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const shouldRenderToRemoveCssAnimation = this.cssAnimationWasSetAt !== undefined
    return this.stateHasChanged(nextState)
      || this.propsHasChanged(nextProps)
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

    return this.props.treeNode.edgeCount() > this.props.autoExpandLimit
  }

  public render() {
    const animationStyle = this.indicatingChangeAnimationStyle()
    const { classes } = this.props
    this.dirtyEdges = this.dirtyMessage = this.dirtySubnodes = false

    return <div
      key={this.props.treeNode.hash()}
      className={`${classes.node} ${!this.props.isRoot ? classes.hover : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        this.toggle()
        this.props.didSelectNode && this.props.didSelectNode(this.props.treeNode)
      }}
    >
      <span ref={this.titleRef} style={animationStyle}>
        <TreeNodeTitle
          onClick={() => this.toggle()}
          collapsed={this.collapsed()}
          treeNode={this.props.treeNode}
          name={this.props.name}
          didSelectNode={this.props.didSelectNode}
          toggleCollapsed={() => this.toggle()}
        />
      </span>
      { this.renderNodes() }
    </div>
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

  private indicatingChangeAnimationStyle(): React.CSSProperties {
    if (this.props.isRoot) {
      return {}
    }
    if (this.cssAnimationWasSetAt && (performance.now() - this.cssAnimationWasSetAt) > 500) {
      this.cssAnimationWasSetAt = undefined
      return {}
    }
    const isInViewPort = this.titleRef.current && isElementInViewport(this.titleRef.current)
    const isDirty = this.dirtyMessage || this.dirtyEdges
    if (this.props.animateChages && isDirty && isInViewPort) {
      if (!this.cssAnimationWasSetAt) {
        this.cssAnimationWasSetAt = performance.now()
      }
      return { animation: 'example 0.5s' }
    }

    return {}
  }
}

export default withStyles(styles)(TreeNode)
