import * as React from 'react'
import DateFormatter from '../helper/DateFormatter'
import { default as ReactResizeDetector } from 'react-resize-detector'
import 'react-vis/dist/style.css'
const { XYPlot, LineMarkSeries, Hint, XAxis, YAxis, HorizontalGridLines } = require('react-vis')
const abbreviate = require('number-abbreviate')

interface Props {
  data: Array<{ x: number; y: number }>
}
// const configuredCurve = d3Shape.curveBundle.beta(1)

interface Stats {
  width: number
  value?: any
}

class PlotHistory extends React.Component<Props, Stats> {
  constructor(props: Props) {
    super(props)
    this.state = { width: 300 }
  }

  private resize = (width: number, height: number) => {
    this.setState({ width: width - 12 })
  }

  private hintFormatter = (point: any) => {
    return [
      { title: <b>Time</b>, value: <DateFormatter date={new Date(point.x)} /> },
      { title: <b>Value</b>, value: point.y },
    ]
  }

  private _forgetValue = () => {
    this.setState({
      value: undefined,
    })
  }

  private _rememberValue = (value: any) => {
    this.setState({ value })
  }

  public render() {
    const data = this.props.data

    return (
      <div style={{ height: '150px', overflow: 'hidden' }}>
        <XYPlot width={this.state.width} height={180}>
          <HorizontalGridLines />
          <XAxis />
          <YAxis width={45} tickFormat={(num: number) => abbreviate(num)} />
          <LineMarkSeries
            onValueMouseOver={this._rememberValue}
            onValueMouseOut={this._forgetValue}
            size={3}
            data={data}
            curve="curveMonotoneX"
          />
          {this.state.value ? <Hint format={this.hintFormatter} value={this.state.value} /> : null}
        </XYPlot>
        <ReactResizeDetector handleWidth={true} onResize={this.resize} />
      </div>
    )
  }
}

export default PlotHistory
