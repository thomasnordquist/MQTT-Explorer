import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Badge, Typography } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

interface HistoryItem {
  title: string
  value: string
}

interface Props {
  items: HistoryItem[]
  onClick?: (index: number, element: EventTarget) => void
  classes: any
  contentTypeIndicator?: String
}

interface State {
  collapsed: boolean
}

class MessageHistory extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      collapsed: true,
    }
  }

  public renderHistory() {
    const style = {
      backgroundColor: 'rgba(80, 80, 80, 0.6)',
      margin: '8px',
      padding: '8px 8px 0 8px',
      cursor: this.props.onClick ? 'pointer' : 'inherit',
    }

    const messageStyle: React.CSSProperties = { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }
    const elements = this.props.items.map((element, index) => (
      <div
        key={index}
        style={style}
        onClick={(event: React.MouseEvent) => this.props.onClick && this.props.onClick(index, event.target)}
      >
        <div><i>{element.title}</i></div>
        <div style={messageStyle}>
          <span><pre>{element.value}</pre></span>
        </div>
      </div>
    ))

    const visible = this.props.items.length > 0 && this.state.collapsed

    return (
      <div style={{ backgroundColor: 'rgba(60, 60, 60, 0.6)', marginTop: '16px' }}>
        <Typography
          onClick={this.toggle}
          style={{ cursor: 'pointer' }}
        >
          <Badge
            classes={{ badge: this.props.classes.badge }}
            invisible={!visible}
            badgeContent={this.props.items.length}
            color="primary"
          >
            {this.state.collapsed ? '▶' : '▼'} History
          </Badge>
          <div style={{ float: 'right' }}>{this.state.collapsed ? this.props.contentTypeIndicator : null}</div>
        </Typography>
        <div style={{ maxHeight: '230px', overflowY: 'scroll'  }}>
          {this.state.collapsed ? null : this.props.children}
          {this.state.collapsed ? null : elements}
        </div>
      </div>
    )
  }

  public render() {
    return (
      <div
        style={{ display: 'block', width: '100%' }}
      >
        {this.renderHistory()}
      </div>
    )
  }

  private toggle = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }
}

const styles = (theme: Theme) => ({
  badge: { right:'-25px' },
})

export default withStyles(styles)(MessageHistory)
