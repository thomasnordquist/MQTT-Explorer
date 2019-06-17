import * as React from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

interface Props {
  onClick: any
  tooltip: string
  classes: any
  style?: React.CSSProperties
}

const styles = (theme: Theme) => ({
  button: {
    padding: '6px',
    fontSize: '1.2em',
    width: '32px',
    height: '32px',
  },
  label: {
    marginTop: '-2px',
  },
})

class CustomIconButton extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  private onClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    this.props.onClick(event)
  }

  public render() {
    return (
      <IconButton className={this.props.classes.button} style={this.props.style} onClick={this.onClick}>
        <Tooltip title={this.props.tooltip} className={this.props.classes.label}>
          <span>{this.props.children}</span>
        </Tooltip>
      </IconButton>
    )
  }
}

export default withStyles(styles)(CustomIconButton)
