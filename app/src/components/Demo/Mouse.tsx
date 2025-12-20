import * as React from 'react'
import { Theme, withStyles } from '@material-ui/core'
const cursor = require('./cursor.png')

interface State {
  enabled: boolean
  target: { x: number; y: number }
  position: { x: number; y: number }
  startPosition: { x: number; y: number }
  startTime: number
  duration: number
  clicking: boolean
}

class Demo extends React.Component<{ classes: any }, State> {
  private timer: any
  private clickTimer: any
  private frameInterval = 20

  constructor(props: any) {
    super(props)
    this.state = {
      enabled: false,
      target: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      startTime: 0,
      duration: 0,
      clicking: false,
    }
  }

  /**
   * Cubic bezier easing function for natural-looking mouse movement
   * Uses control points (0.25, 0.75) for a smooth ease-in-out curve
   */
  private cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  }

  /**
   * Easing function that creates a smooth acceleration and deceleration
   * This makes the mouse movement appear more human-like
   */
  private easeInOutCubic(t: number): number {
    // Cubic bezier approximation for ease-in-out
    return this.cubicBezier(t, 0, 0.25, 0.75, 1)
  }

  private moveCloser() {
    const elapsed = Date.now() - this.state.startTime
    const progress = Math.min(elapsed / (this.state.duration || 1), 1)

    // Apply easing function for smooth, human-like movement timing
    const easedProgress = this.easeInOutCubic(progress)

    // Calculate bezier curve control points for a natural arc trajectory
    // Instead of moving in a straight line, the cursor follows a curved path
    const startX = this.state.startPosition.x
    const startY = this.state.startPosition.y
    const endX = this.state.target.x
    const endY = this.state.target.y

    // Create control points for a quadratic bezier curve
    // The control point is offset perpendicular to the direct line, creating an arc
    const dx = endX - startX
    const dy = endY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Arc height is proportional to distance (80% of distance, capped at 200px max)
    // Quadrupled from original 20% to make the curve highly visible
    const arcHeight = Math.min(distance * 0.8, 200)

    // Calculate perpendicular offset for the control point
    const perpX = -dy / (distance || 1)
    const perpY = dx / (distance || 1)

    // Control point is at the midpoint, offset perpendicular to create an arc
    const controlX = (startX + endX) / 2 + perpX * arcHeight
    const controlY = (startY + endY) / 2 + perpY * arcHeight

    // Calculate position on quadratic bezier curve: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const t = easedProgress
    const u = 1 - t
    const newX = u * u * startX + 2 * u * t * controlX + t * t * endX
    const newY = u * u * startY + 2 * u * t * controlY + t * t * endY

    this.setState({
      position: {
        x: newX,
        y: newY,
      },
    })

    // Continue animation if not complete
    if (progress < 1) {
      this.timer = setTimeout(() => {
        this.moveCloser()
      }, this.frameInterval)
    } else {
      this.timer && clearTimeout(this.timer)
    }
  }

  public componentDidMount() {
    ;(window as any).demo.enableMouse = () => {
      this.setState({ enabled: true })
    }
    ;(window as any).demo.moveMouse = (x: number, y: number, animationTime: number) => {
      this.setState({
        enabled: true,
        target: { x, y },
        startPosition: { x: this.state.position.x, y: this.state.position.y },
        startTime: Date.now(),
        duration: animationTime,
      })
      this.moveCloser()
    }
    ;(window as any).demo.clickMouse = () => {
      this.setState({ clicking: true })
      this.clickTimer && clearTimeout(this.clickTimer)
      this.clickTimer = setTimeout(() => {
        this.setState({ clicking: false })
      }, 300)
    }
  }

  public componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
    this.clickTimer && clearTimeout(this.clickTimer)
  }

  public render() {
    if (!this.state.enabled) {
      return null
    }

    const cursorStyle = {
      left: this.state.position.x + 2,
      top: this.state.position.y + 2,
    }

    return (
      <>
        <img src={cursor} style={cursorStyle} className={this.props.classes.cursor} />
        {this.state.clicking && <div style={cursorStyle} className={this.props.classes.clickRipple} />}
      </>
    )
  }
}

const style = (theme: Theme) => ({
  '@keyframes clickPulse': {
    from: {
      transform: 'scale(1)',
      opacity: 1,
    },
    to: {
      transform: 'scale(2.5)',
      opacity: 0,
    },
  },
  cursor: {
    width: '32px',
    height: '32px',
    position: 'fixed' as 'fixed',
    zIndex: 1000000,
    filter: theme.palette.type === 'light' ? undefined : 'invert(100%)',
    pointerEvents: 'none' as 'none',
  },
  clickRipple: {
    width: '48px',
    height: '48px',
    position: 'fixed' as 'fixed',
    zIndex: 1000000 - 1, // Just below cursor
    borderRadius: '50%',
    border: '4px solid #4CAF50',
    animation: '$clickPulse 300ms ease-out',
    pointerEvents: 'none' as 'none',
  },
})

export default withStyles(style)(Demo)
