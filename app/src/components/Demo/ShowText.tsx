import * as React from 'react'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import Key from './Key'

interface State {
  message?: string
  keys: Array<string>
  location: string
}

class Demo extends React.Component<{ classes: any }, State> {
  private timer: any

  constructor(props: any) {
    super(props)
    this.state = { location: 'bottom', keys: [] }
  }

  private clearTimer() {
    this.timer && clearTimeout(this.timer)
  }

  public componentDidMount() {
    ;(window as any).demo.showMessage = (
      message: string,
      location: string,
      duration: number,
      keys: Array<string> = []
    ) => {
      this.clearTimer()
      this.setState({ message, location, keys })
      this.timer = setTimeout(() => this.setState({ message: undefined }), duration)
    }
    ;(window as any).demo.hideMessage = () => {
      this.clearTimer()
      this.setState({ message: undefined })
    }
  }

  public render() {
    const positions: { [s: string]: number } = {
      top: 0,
      bottom: -65,
      middle: -32,
    }
    const style = {
      position: 'fixed' as const,
      left: '5vw',
      zIndex: 1000000,
      margin: '30vw auto 50vw',
      right: '5vw',
      bottom: `${positions[this.state.location]}vh`,
    }
    const style2 = {
      textAlign: 'center' as const,
      fontSize: '4em',
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '16px',
    }

    if (!this.state.message) {
      return null
    }

    let keys: Array<any> = []
    if (this.state.keys.length > 0) {
      keys = this.state.keys
        .map(key => [<Key key={key} keyboardKey={key} />])
        .reduce((prev, current) => [prev, '+' as any, current])
    }

    return (
      <div style={style}>
        <div style={style2}>
          <span>{this.state.message}</span>
          {keys.length > 0 ? <div className={this.props.classes.keysStyle}>{keys}</div> : null}
        </div>
      </div>
    )
  }
}

const style = (theme: Theme) => ({
  keysStyle: {
    fontSize: '1em',
    display: 'inline-block' as const,
    transform: 'translateY(0.3em) translateX(0.8em)',
  },
})

export default withStyles(style)(Demo)
