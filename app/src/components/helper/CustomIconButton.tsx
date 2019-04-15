import * as React from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

interface Props {
  onClick: any
  tooltip: string
  classes: any
}

const styles = (theme: Theme) => ({
  button: {
    padding: '6px',
    fontSize: '1.2em',
    width: '32px',
    height: '32px',
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
      <IconButton className={this.props.classes.button} onClick={this.onClick}>
        <Tooltip title={this.props.tooltip}>
          <span>{this.props.children}</span>
        </Tooltip>
      </IconButton>
    )
  }
}

export default withStyles(styles)(CustomIconButton)
