import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Theme, withStyles } from '@material-ui/core/styles'

import LabelImportant from '@material-ui/icons/LabelImportant'
import TreeNodeSubnodes from './TreeNodeSubnodes'
import TreeNodeTitle from './TreeNodeTitle'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { isElementInViewport } from '../helper/isElementInViewport'
import { treeActions } from '../../actions'
import { AppState } from '../../reducers'

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
    topicSelect: {
      float: 'right' as 'right',
      opacity: 0,
      cursor: 'pointer',
      marginTop: '-1px',
    },
  }
}

interface Props {
  actions: typeof treeActions
  lastUpdate: number
  animateChages: boolean
  isRoot?: boolean
  treeNode: q.TreeNode
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  autoExpandLimit: number
  classes: any
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
  private topicSelectRef = React.createRef<HTMLDivElement>()

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
        onMouseOver={this.mouseOver}
        onMouseOut={this.mouseOut}
      >
        <span ref={this.titleRef} style={animation}>
          <TreeNodeTitle
            collapsed={this.collapsed()}
            treeNode={this.props.treeNode}
            name={this.props.name}
            lastUpdate={this.props.treeNode.lastUpdate}
          />
        </span>
        <div
          className={this.props.classes.topicSelect}
          ref={this.topicSelectRef}
          onClick={this.didSelectNode}
          title="Select topic"
        >
          <LabelImportant style={{ fontSize: '14px' }} />
        </div>
        {this.renderNodes()}
      </div>
    )
  }

  private mouseOver = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (this.topicSelectRef.current) {
      this.topicSelectRef.current.style.opacity = '1'
    }
  }
  private mouseOut = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (this.topicSelectRef.current) {
      this.topicSelectRef.current.style.opacity = '0'
    }
  }

  private didSelectNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (this.topicSelectRef.current) {
      this.topicSelectRef.current.style.opacity = '1'
    }
    this.props.actions.selectTopic(this.props.treeNode)
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

const mapStateToProps = (state: AppState) => {
  return {
    autoExpandLimit: state.settings.autoExpandLimit,
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(TreeNode))
