import * as React from 'react'
import { IconButton } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'

interface Props {
  onClick: any,
  classes: any,
}

const styles = (theme: Theme) => ({
  button: {
    padding: '6px',
    fontSize: '1.2em',
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
      <IconButton className={this.props.classes.button} onClick={this.onClick}>{this.props.children}</IconButton>
    )
  }
}

export default withStyles(styles)(CustomIconButton)
