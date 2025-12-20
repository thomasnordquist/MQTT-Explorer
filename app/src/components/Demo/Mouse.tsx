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
  jitterSeed: number
  overshootTarget: { x: number; y: number } | null
  isOvershootCorrection: boolean
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
      jitterSeed: Math.random(),
      overshootTarget: null,
      isOvershootCorrection: false,
    }
  }

  /**
   * Generates a seeded random value for consistent but varied jitter
   * Uses a simple hash-based PRNG to ensure reproducible jitter patterns
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  /**
   * Adds human-like micro-movements to the cursor position
   * Small random offsets that don't affect the overall path significantly
   */
  private addJitter(x: number, y: number, progress: number): { x: number; y: number } {
    // Jitter is strongest in the middle of the movement (more natural)
    const jitterStrength = Math.sin(progress * Math.PI) * 2 // 0 at start/end, max at middle

    // Use progress to vary the seed for different jitter at each frame
    const seed1 = this.state.jitterSeed * 1000 + progress * 100
    const seed2 = this.state.jitterSeed * 2000 + progress * 150

    const jitterX = (this.seededRandom(seed1) - 0.5) * jitterStrength
    const jitterY = (this.seededRandom(seed2) - 0.5) * jitterStrength

    return {
      x: x + jitterX,
      y: y + jitterY,
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

  /**
   * Calculates an overshoot target for more realistic human-like movement
   * Returns null if no overshoot, or a point slightly past the target
   */
  private calculateOvershootTarget(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ): { x: number; y: number } | null {
    // 30% chance of overshoot for natural variation
    if (this.seededRandom(this.state.jitterSeed * 3) > 0.3) {
      return null
    }

    const dx = targetX - startX
    const dy = targetY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Overshoot by 2-8% of the distance
    const overshootPercent = 0.02 + this.seededRandom(this.state.jitterSeed * 4) * 0.06
    const overshootDistance = distance * overshootPercent

    // Overshoot in the direction of movement
    const dirX = dx / (distance || 1)
    const dirY = dy / (distance || 1)

    return {
      x: targetX + dirX * overshootDistance,
      y: targetY + dirY * overshootDistance,
    }
  }

  private moveCloser() {
    const elapsed = Date.now() - this.state.startTime
    const progress = Math.min(elapsed / (this.state.duration || 1), 1)

    // Apply easing function for smooth, human-like movement timing
    const easedProgress = this.easeInOutCubic(progress)

    // Determine actual target (could be overshoot target or final target)
    const actualTarget = this.state.overshootTarget || this.state.target

    // Calculate bezier curve control points for a natural arc trajectory
    // Instead of moving in a straight line, the cursor follows a curved path
    const startX = this.state.startPosition.x
    const startY = this.state.startPosition.y
    const endX = actualTarget.x
    const endY = actualTarget.y

    // Create control points for a quadratic bezier curve
    // The control point is offset perpendicular to the direct line, creating an arc
    const dx = endX - startX
    const dy = endY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Arc height is proportional to distance (80% of distance, capped at 200px max)
    // Quadrupled from original 20% to make the curve highly visible
    // For overshoot correction, use smaller arc (more direct)
    const arcPercent = this.state.isOvershootCorrection ? 0.3 : 0.8
    const arcCap = this.state.isOvershootCorrection ? 50 : 200
    const arcHeight = Math.min(distance * arcPercent, arcCap)

    // Calculate perpendicular offset for the control point
    const perpX = -dy / (distance || 1)
    const perpY = dx / (distance || 1)

    // Add slight randomness to control point to avoid perfectly predictable curves
    const controlPointJitter = this.seededRandom(this.state.jitterSeed * 5) * 20 - 10

    // Control point is at the midpoint, offset perpendicular to create an arc
    const controlX = (startX + endX) / 2 + perpX * (arcHeight + controlPointJitter)
    const controlY = (startY + endY) / 2 + perpY * (arcHeight + controlPointJitter)

    // Calculate position on quadratic bezier curve: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const t = easedProgress
    const u = 1 - t
    let newX = u * u * startX + 2 * u * t * controlX + t * t * endX
    let newY = u * u * startY + 2 * u * t * controlY + t * t * endY

    // Add jitter for human-like micro-movements
    const jittered = this.addJitter(newX, newY, progress)
    newX = jittered.x
    newY = jittered.y

    this.setState({
      position: {
        x: newX,
        y: newY,
      },
    })

    // Continue animation if not complete
    if (progress < 1) {
      // Add random delay variation (jitter in timing)
      // Frame interval varies between 15-25ms for irregular movement
      const jitterDelay = this.seededRandom(this.state.jitterSeed * 6 + elapsed) * 10 - 5
      const nextInterval = Math.max(10, this.frameInterval + jitterDelay)

      this.timer = setTimeout(() => {
        this.moveCloser()
      }, nextInterval)
    } else {
      this.timer && clearTimeout(this.timer)

      // If we just reached overshoot target, start correction to actual target
      if (this.state.overshootTarget && !this.state.isOvershootCorrection) {
        const correctionDuration = this.state.duration * 0.15 // Correction takes 15% of original time
        setTimeout(() => {
          this.setState({
            startPosition: { x: this.state.position.x, y: this.state.position.y },
            target: this.state.target, // Keep original target
            overshootTarget: null, // Clear overshoot
            isOvershootCorrection: true,
            startTime: Date.now(),
            duration: correctionDuration,
          })
          this.moveCloser()
        }, 50) // Small delay before correction
      } else {
        // Reset overshoot state for next movement
        this.setState({ isOvershootCorrection: false })
      }
    }
  }

  public componentDidMount() {
    ;(window as any).demo.enableMouse = () => {
      this.setState({ enabled: true })
    }
    ;(window as any).demo.moveMouse = (x: number, y: number, animationTime: number) => {
      const newJitterSeed = Math.random()
      const currentPos = this.state.position

      // Calculate if this movement should have overshoot
      const overshoot = this.calculateOvershootTarget(currentPos.x, currentPos.y, x, y)

      // If overshoot exists, adjust duration to account for correction time
      // Main movement gets 85% of time, correction gets 15%
      const mainDuration = overshoot ? animationTime * 0.85 : animationTime

      this.setState({
        enabled: true,
        target: { x, y }, // Store the actual target
        overshootTarget: overshoot, // May be null or an overshoot position
        isOvershootCorrection: false,
        startPosition: { x: currentPos.x, y: currentPos.y },
        startTime: Date.now(),
        duration: mainDuration,
        jitterSeed: newJitterSeed,
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
