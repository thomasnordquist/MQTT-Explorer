import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { treeActions } from '../../actions'
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
  actions: any
  lastUpdate: number
  animateChages: boolean
  isRoot?: boolean
  treeNode: q.TreeNode
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  didSelectNode?: (node: q.TreeNode) => void
  classes: any
  autoExpandLimit: number
  style?: React.CSSProperties
}

interface State {
  collapsedOverride: boolean | undefined
}

class TreeNode extends React.Component<Props, State> {
  private dirtySubnodes: boolean = true
  private dirtyEdges: boolean = true
  private dirtyMessage: boolean = true
  private animationDirty: boolean = false

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
      || this.animationDirty
      || shouldRenderToRemoveCssAnimation
  }

  public componentDidUpdate() {
    if (this.props.performanceCallback) {
      const renderTime = performance.now() - this.willUpdateTime
      this.props.performanceCallback(renderTime)
    }
    // setTimeout(() => {
    //   this.setState(this.state)
    // }, 500)
    // this.addCssAnimation()
    // setTimeout(this.removeCssAnimation, 500)

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

  // private addCssAnimation = () => {
  //   const element = this.titleRef.current
  //   if ((this.dirtyEdges || this.dirtyMessage || this.dirtySubnodes) && element && isElementInViewport(element)) {
  //     element.style.animation = 'example 0.5s'
  //   }
  // }
  //
  // private removeCssAnimation = () => {
  //   const element = this.titleRef.current
  //   if (element && element.style.animation) {
  //     element.style.animation = ''
  //   }
  // }

  public render() {
    const { classes } = this.props
    const isDirty = this.dirtyEdges || this.dirtyMessage || this.dirtySubnodes
    this.dirtyEdges = this.dirtyMessage = this.dirtySubnodes = false

    const shouldStartAnimation = (isDirty && !this.animationDirty) && !this.props.isRoot
    const animation = shouldStartAnimation ? { animation: 'example 0.5s' } : {}
    this.animationDirty = shouldStartAnimation

    return (
      <div
        key={this.props.treeNode.hash()}
        className={`${classes.node} ${!this.props.isRoot ? classes.hover : ''}`}
        onClick={this.didClickNode}
        style={this.props.style}
      >
        <span ref={this.titleRef} style={animation}>
          <TreeNodeTitle
            collapsed={this.collapsed()}
            treeNode={this.props.treeNode}
            name={this.props.name}
          />
        </span>
        {this.renderNodes()}
      </div>
    )
  }

  private didClickNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    this.toggle()
    this.props.actions.selectTopic(this.props.treeNode)
  }

  private renderNodes() {
    return (
      <TreeNodeSubnodes
        animateChanges={this.props.animateChages}
        collapsed={this.collapsed()}
        autoExpandLimit={this.props.autoExpandLimit}
        didSelectNode={this.props.didSelectNode}
        treeNode={this.props.treeNode}
        lastUpdate={this.props.treeNode.lastUpdate}
      />
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(treeActions, dispatch),
  }
}

export default withStyles(styles)(connect(null, mapDispatchToProps)(TreeNode))
