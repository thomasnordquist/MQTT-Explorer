import * as React from 'react'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

const cursor = require('./cursor.png')

interface State {
  enabled: boolean
  target: { x: number; y: number }
  position: { x: number; y: number }
  stepSizeX: number
  stepSizeY: number
}

class Demo extends React.Component<{ classes: any }, State> {
  private timer: any

  private frameInterval = 20

  constructor(props: any) {
    super(props)
    this.state = {
      enabled: false,
      target: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      stepSizeX: 1,
      stepSizeY: 1,
    }
  }

  private moveCloser(steps: number = 0) {
    const steSizeX = Math.min(this.state.stepSizeX, Math.abs(this.state.position.x - this.state.target.x))
    const steSizeY = Math.min(this.state.stepSizeY, Math.abs(this.state.position.y - this.state.target.y))
    const dirX = this.state.position.x > this.state.target.x ? -1 : 1
    const dirY = this.state.position.y > this.state.target.y ? -1 : 1

    if (steSizeX <= 0.1 && steSizeY <= 0.1) {
      this.timer && clearTimeout(this.timer)
      return
    }

    this.setState({
      position: {
        x: this.state.position.x + dirX * steSizeX,
        y: this.state.position.y + dirY * steSizeY,
      },
    })

    this.timer = setTimeout(() => {
      this.moveCloser(steps + 1)
    }, this.frameInterval)
  }

  public componentDidMount() {
    ;(window as any).demo.enableMouse = () => {
      this.setState({ enabled: true })
    }
    ;(window as any).demo.moveMouse = (x: number, y: number, animationTime: number) => {
      const stepSizeX = Math.abs(this.state.position.x - x) / (animationTime / this.frameInterval)
      const stepSizeY = Math.abs(this.state.position.y - y) / (animationTime / this.frameInterval)
      this.setState({
        stepSizeX,
        stepSizeY,
        enabled: true,
        target: { x, y },
      })
      this.moveCloser()
    }
  }

  public render() {
    if (!this.state.enabled) {
      return null
    }

    const cursorStyle = {
      left: this.state.position.x + 2,
      top: this.state.position.y + 2,
    }

    return <img src={cursor} style={cursorStyle} className={this.props.classes.cursor} />
  }
}

const style = (theme: Theme) => ({
  cursor: {
    width: '32px',
    height: '32px',
    position: 'fixed' as const,
    zIndex: 1000000,
    filter: theme.palette.mode === 'light' ? undefined : 'invert(100%)',
    pointerEvents: 'none' as const,
  },
})

export default withStyles(style)(Demo)
