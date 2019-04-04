import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import TreeNodeSubnodes from './TreeNodeSubnodes'
import TreeNodeTitle from './TreeNodeTitle'
import { Theme, withStyles } from '@material-ui/core/styles'
import { TopicOrder } from '../../reducers/Settings'
import { TopicViewModel } from '../../TopicViewModel'

const debounce = require('lodash.debounce')

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
    topicSelect: {
      float: 'right' as 'right',
      opacity: 0,
      cursor: 'pointer',
      marginTop: '-1px',
    },
    subnodes: {
      marginLeft: theme.spacing(1.5),
    },
    selected: {
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(170, 170, 170, 0.55)' : 'rgba(170, 170, 170, 0.55)',
    },
    hover: {
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(100, 100, 100, 0.55)' : 'rgba(200, 200, 200, 0.55)',
    },
  }
}

interface Props {
  animateChages: boolean
  isRoot?: boolean
  treeNode: q.TreeNode<TopicViewModel>
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  classes: any
  className?: string
  topicOrder: TopicOrder
  autoExpandLimit: number
  lastUpdate: number
  didSelectTopic: any
  highlightTopicUpdates: boolean
  selectTopicWithMouseOver: boolean
  theme: Theme
}

interface State {
  collapsedOverride: boolean | undefined
  mouseOver: boolean
  selected: boolean
}

class TreeNode extends React.Component<Props, State> {
  private dirtySubnodes: boolean = true
  private dirtyEdges: boolean = true
  private dirtyMessage: boolean = true
  private animationDirty: boolean = false

  private cssAnimationWasSetAt?: number

  private willUpdateTime: number = performance.now()
  private nodeRef?: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>()

  private setHover = debounce((hover: boolean) => {
    this.setState({ mouseOver: hover })
  }, 45)

  constructor(props: Props) {
    super(props)

    this.state = {
      collapsedOverride: props.collapsed,
      mouseOver: false,
      selected: false,
    }
  }

  private subnodesDidchange = () => {
    this.dirtySubnodes = true
  }

  private messageDidChange = () => {
    this.dirtyMessage = true
  }

  private edgesDidChange = () => {
    this.dirtyMessage = true
  }

  private addSubscriber(treeNode: q.TreeNode<TopicViewModel>) {
    treeNode.viewModel = new TopicViewModel()
    treeNode.viewModel.change.subscribe(this.viewStateHasChanged)
    treeNode.onMerge.subscribe(this.subnodesDidchange)
    treeNode.onEdgesChange.subscribe(this.edgesDidChange)
    treeNode.onMessage.subscribe(this.messageDidChange)
  }

  private viewStateHasChanged = (msg: void, viewModel: TopicViewModel) => {
    this.setState({ selected: viewModel.isSelected() })
  }

  private removeSubscriber(treeNode: q.TreeNode<TopicViewModel>) {
    treeNode.viewModel && treeNode.viewModel.change.unsubscribe(this.viewStateHasChanged)
    treeNode.viewModel = undefined
    treeNode.onMerge.unsubscribe(this.subnodesDidchange)
    treeNode.onEdgesChange.unsubscribe(this.edgesDidChange)
    treeNode.onMessage.unsubscribe(this.messageDidChange)
  }

  private stateHasChanged(newState: State) {
    return this.state.collapsedOverride !== newState.collapsedOverride
      || this.state.mouseOver !== newState.mouseOver
      || this.state.selected !== newState.selected
  }

  private propsHasChanged(newProps: Props) {
    return this.props.autoExpandLimit !== newProps.autoExpandLimit
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

  private didSelectTopic = () => {
    this.props.didSelectTopic(this.props.treeNode)
  }

  private didClickTitle = (event: React.MouseEvent) => {
    event.preventDefault()
    this.props.didSelectTopic(this.props.treeNode)
    this.toggle()
  }

  private mouseOver = (event: React.MouseEvent) => {
    event.stopPropagation()
    this.setHover(true)
    if (this.props.selectTopicWithMouseOver && this.props.treeNode && this.props.treeNode.message && this.props.treeNode.message.value) {
      this.props.didSelectTopic(this.props.treeNode)
    }
  }

  private mouseOut = (event: React.MouseEvent) => {
    event.stopPropagation()
    this.setHover(false)
  }

  private toggleCollapsed = (event: React.MouseEvent) => {
    event.stopPropagation()
    this.toggle()
  }

  private renderNodes() {
    if (this.collapsed()) {
      return null
    }

    return (
      <TreeNodeSubnodes
        animateChanges={this.props.animateChages}
        collapsed={this.collapsed()}
        treeNode={this.props.treeNode}
        autoExpandLimit={this.props.autoExpandLimit}
        topicOrder={this.props.topicOrder}
        lastUpdate={this.props.treeNode.lastUpdate}
        didSelectTopic={this.props.didSelectTopic}
        highlightTopicUpdates={this.props.highlightTopicUpdates}
        selectTopicWithMouseOver={this.props.selectTopicWithMouseOver}
      />
    )
  }

  public componentDidMount() {
    const { treeNode } = this.props
    this.addSubscriber(treeNode)
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.treeNode !== this.props.treeNode) {
      this.removeSubscriber(this.props.treeNode)
      this.addSubscriber(nextProps.treeNode)
    }
  }

  public componentWillUnmount() {
    const { treeNode } = this.props
    this.removeSubscriber(treeNode)
    this.nodeRef = undefined
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const shouldRenderToRemoveCssAnimation = this.cssAnimationWasSetAt !== undefined
    return this.stateHasChanged(nextState)
      || this.propsHasChanged(nextProps)
      || (this.dirtyEdges || this.dirtyMessage || this.dirtySubnodes)
      || this.animationDirty
      || shouldRenderToRemoveCssAnimation
  }

  public componentDidUpdate() {
    if (this.props.performanceCallback) {
      const renderTime = performance.now() - this.willUpdateTime
      this.props.performanceCallback(renderTime)
    }
  }

  public componentWillUpdate() {
    if (this.props.performanceCallback) {
      this.willUpdateTime = performance.now()
    }
  }

  public render() {
    const { classes } = this.props
    const isDirty = this.dirtyEdges || this.dirtyMessage || this.dirtySubnodes
    this.dirtyEdges = this.dirtyMessage = this.dirtySubnodes = false

    const shouldStartAnimation = (isDirty && !this.animationDirty) && !this.props.isRoot && this.props.highlightTopicUpdates
    const animationName = this.props.theme.palette.type === 'light' ? 'updateLight' : 'updateDark'
    const animation = shouldStartAnimation ? { willChange: 'auto', translateZ: 0, animation: `${animationName} 0.5s` } : {}
    this.animationDirty = shouldStartAnimation

    const highlightClass = this.state.selected ? this.props.classes.selected : (this.state.mouseOver ? this.props.classes.hover : '')

    return (
      <div>
        <div
          key={this.props.treeNode.hash()}
          className={`${classes.node} ${this.props.className}`}
          onMouseOver={this.mouseOver}
          onMouseOut={this.mouseOut}
          onClick={this.didClickTitle}
          ref={this.nodeRef}
        >
          <TreeNodeTitle
            style={animation}
            toggleCollapsed={this.toggleCollapsed}
            didSelectNode={this.didSelectTopic}
            collapsed={this.collapsed()}
            treeNode={this.props.treeNode}
            name={this.props.name}
            className={highlightClass}
          />
        </div>
        <div className={classes.subnodes}>
          {this.renderNodes()}
        </div>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(TreeNode)
