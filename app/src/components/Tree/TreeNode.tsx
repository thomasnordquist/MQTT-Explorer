import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import TreeNodeSubnodes from './TreeNodeSubnodes'
import TreeNodeTitle from './TreeNodeTitle'
import { Record } from 'immutable'
import { SettingsState } from '../../reducers/Settings'
import { Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../model/TopicViewModel'

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
    title: {
      borderRadius: '4px',
      lineHeight: '1em',
      display: 'inline-block' as 'inline-block',
      whiteSpace: 'nowrap' as 'nowrap',
      padding: '1px 4px 0px 4px',
      height: '14px',
      margin: '1px 0px 2px 0px',
    },
  }
}

interface Props {
  isRoot?: boolean
  treeNode: q.TreeNode<TopicViewModel>
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  classes: any
  className?: string
  lastUpdate: number
  didSelectTopic: any
  theme: Theme
  settings: Record<SettingsState>
}

interface State {
  collapsedOverride: boolean | undefined
  mouseOver: boolean
  selected: boolean
}

class TreeNodeComponent extends React.Component<Props, State> {
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

  private addSubscriber(treeNode: q.TreeNode<TopicViewModel>) {
    treeNode.viewModel = new TopicViewModel()
    treeNode.viewModel.change.subscribe(this.viewStateHasChanged)
  }

  private viewStateHasChanged = () => {
    this.props.treeNode.viewModel && this.setState({ selected: this.props.treeNode.viewModel.isSelected() })
  }

  private removeSubscriber(treeNode: q.TreeNode<TopicViewModel>) {
    treeNode.viewModel && treeNode.viewModel.change.unsubscribe(this.viewStateHasChanged)
    treeNode.viewModel = undefined
  }

  private stateHasChanged(newState: State) {
    return this.state.collapsedOverride !== newState.collapsedOverride
      || this.state.mouseOver !== newState.mouseOver
      || this.state.selected !== newState.selected
  }

  private toggle() {
    this.setState({ collapsedOverride: !this.collapsed() })
  }

  private collapsed() {
    if (this.state.collapsedOverride !== undefined) {
      return this.state.collapsedOverride
    }

    return this.props.treeNode.edgeCount() > this.props.settings.get('autoExpandLimit')
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
    if (this.props.settings.get('selectTopicWithMouseOver') && this.props.treeNode && this.props.treeNode.message && this.props.treeNode.message.value) {
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
        collapsed={this.collapsed()}
        treeNode={this.props.treeNode}
        lastUpdate={this.props.treeNode.lastUpdate}
        didSelectTopic={this.props.didSelectTopic}
        settings={this.props.settings}
      />
    )
  }

  public componentDidMount() {
    const { treeNode } = this.props
    this.addSubscriber(treeNode)
  }

  public componentWillUnmount() {
    const { treeNode } = this.props
    this.removeSubscriber(treeNode)
    this.nodeRef = undefined
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const shouldRenderToRemoveCssAnimation = this.cssAnimationWasSetAt !== undefined
    return this.stateHasChanged(nextState)
      || this.props.settings !== nextProps.settings
      || (this.props.lastUpdate !== nextProps.lastUpdate)
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

    const shouldStartAnimation = (!this.animationDirty) && !this.props.isRoot && this.props.settings.get('highlightTopicUpdates')
    const animationName = this.props.theme.palette.type === 'light' ? 'updateLight' : 'updateDark'
    const animation = shouldStartAnimation ? { willChange: 'auto', translateZ: 0, animation: `${animationName} 0.5s` } : {}
    this.animationDirty = shouldStartAnimation

    const highlightClass = this.state.selected ? this.props.classes.selected : (this.state.mouseOver ? this.props.classes.hover : '')

    return (
      <div>
        <div
          key={this.props.treeNode.hash()}
          className={`${classes.node} ${this.props.className} ${highlightClass} ${classes.title}`}
          style={animation}
          onMouseOver={this.mouseOver}
          onMouseOut={this.mouseOut}
          onClick={this.didClickTitle}
          ref={this.nodeRef}
        >
          <TreeNodeTitle
            toggleCollapsed={this.toggleCollapsed}
            didSelectNode={this.didSelectTopic}
            collapsed={this.collapsed()}
            treeNode={this.props.treeNode}
            name={this.props.name}
          />
        </div>
        {this.renderNodes()}
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(TreeNodeComponent)
