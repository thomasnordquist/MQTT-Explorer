import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import DateFormatter from '../helper/DateFormatter'
import { default as ReactResizeDetector } from 'react-resize-detector'
import 'react-vis/dist/style.css'
const { XYPlot, LineMarkSeries, Hint, YAxis, HorizontalGridLines } = require('react-vis')

interface Props {
  messages: q.Message[]
}

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

  public render() {
    const data = this.props.messages.map((message) => {
      return {
        x: message.received.getTime(),
        y: parseFloat(message.value),
      }
    })

    return (
      <div>
        <XYPlot width={this.state.width} height={150}>
          <HorizontalGridLines />
          <YAxis />
          <LineMarkSeries
            onValueMouseOver={this._rememberValue}
            onValueMouseOut={this._forgetValue}
            size={3}
            data={data}
            curve="curveCardinal"
          />
          {this.state.value ? <Hint format={this.hintFormatter} value={this.state.value} /> : null}
        </XYPlot>
        <ReactResizeDetector handleWidth={true} onResize={this.resize} />
      </div>
    )
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
}

export default PlotHistory
