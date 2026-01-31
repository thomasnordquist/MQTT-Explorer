import * as React from 'react'
import Pause from '@mui/icons-material/PauseCircleFilled'
import Resume from '@mui/icons-material/PlayArrow'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import * as q from '../../../../backend/src/Model'
import CustomIconButton from '../helper/CustomIconButton'
import { treeActions } from '../../actions'
import { AppState } from '../../reducers'

const styles = (theme: Theme) => ({
  icon: {
    color: theme.palette.primary.contrastText,
    verticalAlign: 'middle' as const,
  },
  bufferStats: {
    minWidth: '8em',
  },
})

interface Props {
  classes: any
  actions: {
    tree: typeof treeActions
  }
  paused: boolean
  tree?: q.Tree<any>
}

class PauseButton extends React.PureComponent<Props, { changes: number }> {
  private timer?: any

  constructor(props: Props) {
    super(props)
    this.state = { changes: 0 }
  }

  private renderBufferStats() {
    if (!this.props.tree) {
      return
    }

    return (
      <span className={this.props.classes.bufferStats}>
        {this.state.changes} changes
        <br />
        buffer at {Math.round(this.props.tree.unmergedChanges().fillState() * 10000) / 100}%
      </span>
    )
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
    const message = this.props.paused
      ? 'Resumes updating the tree, after applying all recorded changes'
      : 'Stops all updates, records changes until the buffer is full.'
    return (
      <div style={{ display: 'inline-flex' }}>
        <span>
          <CustomIconButton onClick={this.props.actions.tree.togglePause} tooltip={message}>
            {this.props.paused ? (
              <Resume className={this.props.classes.icon} />
            ) : (
              <Pause className={this.props.classes.icon} />
            )}
          </CustomIconButton>
        </span>
        {this.props.paused ? this.renderBufferStats() : null}
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  paused: state.tree.get('paused'),
  tree: state.tree.get('tree'),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    tree: bindActionCreators(treeActions, dispatch),
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PauseButton) as any)
