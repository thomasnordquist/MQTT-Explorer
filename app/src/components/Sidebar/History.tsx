import * as React from 'react'

import { Badge, Typography } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

interface HistoryItem {
  title: JSX.Element | string
  value: string
  selected?: boolean
}

interface Props {
  items: HistoryItem[]
  onClick?: (index: number, element: EventTarget) => void
  classes: any
  contentTypeIndicator?: JSX.Element
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
    const style = (element: HistoryItem) => ({
      backgroundColor: element.selected ? 'rgba(120, 120, 120, 0.6)' : 'rgba(80, 80, 80, 0.6)',
      margin: '8px',
      padding: '8px 8px 0 8px',
      cursor: this.props.onClick ? 'pointer' : 'inherit',
    })

    const messageStyle: React.CSSProperties = { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }
    const elements = this.props.items.map((element, index) => (
      <div
        key={index}
        style={style(element)}
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
          component={'span'}
          onClick={this.toggle}
          style={{ cursor: 'pointer' }}
        >
          <Badge
            classes={{ badge: this.props.classes.badge }}
            invisible={!visible}
            badgeContent={this.props.items.length}
            color="primary"
          >
            {this.state.collapsed ? '▶ History' : '▼ History'}
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
