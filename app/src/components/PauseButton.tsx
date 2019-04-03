import * as React from 'react'
import * as q from '../../../backend/src/Model'
import CustomIconButton from './CustomIconButton'
import Pause from '@material-ui/icons/PauseCircleFilled'
import Resume from '@material-ui/icons/PlayCircleFilled'
import { AppState } from '../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { treeActions } from '../actions'
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles'
import { Tooltip } from '@material-ui/core';

const styles: StyleRulesCallback = theme => ({ })

interface Props {
  classes: any
  actions: {
    tree: typeof treeActions,
  }
  paused: boolean
  tree?: q.Tree<any>
}

class PauseButton extends React.Component<Props, {changes: number}> {
  private timer?: any
  constructor(props: Props) {
    super(props)
    this.state = { changes: 0 }
  }

  public componentDidMount() {
    this.timer = setInterval(() => {
      if (!this.props.paused || !this.props.tree) {
        return
      }

      const changes = this.props.tree.unmergedChanges()
      if (this.state.changes !== changes.length) {
        this.setState({ changes: changes.length })
      }
    }, 300)
  }

  public componentWillUnmount() {
    this.timer && clearInterval(this.timer)
  }

  public render() {
    const { actions, classes } = this.props

    return (
      <div style={{ display: 'inline-flex' }}>
        <span>
          <CustomIconButton onClick={this.props.actions.tree.togglePause} >
            {this.props.paused ? this.renderResume() : this.renderPause()}
          </CustomIconButton>
        </span>
        {this.props.paused ? this.renderBufferStats() : null}
      </div>
    )
  }

  private renderResume() {
    return (
      <Tooltip title="Resumes updating the tree, after applying all recorded changes">
        <Resume />
      </Tooltip>
    )
  }

  private renderPause() {
    return (
      <Tooltip title="Stops all updates, records changes until the buffer is full.">
        <Pause />
      </Tooltip>
    )
  }

  private renderBufferStats() {
    if (!this.props.tree) {
      return
    }

    return (
      <span>
        {this.state.changes} changes<br />
        buffer at {Math.round(this.props.tree.unmergedChanges().fillState() * 10000) / 100}%
      </span>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    paused: state.tree.paused,
    tree: state.tree.tree,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      tree: bindActionCreators(treeActions, dispatch),
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PauseButton))
