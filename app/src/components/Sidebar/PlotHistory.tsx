const { XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries } = require('react-vis')
import { default as ReactResizeDetector } from 'react-resize-detector'

import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import 'react-vis/dist/style.css'

interface Props {
  messages: q.Message[]
}

interface Stats {
  width: number
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
        x: message.received,
        y: message.value,
      }
    })

    return (
      <div>
        <XYPlot width={this.state.width} height={150}>
          <HorizontalGridLines />
          <LineSeries data={data} />
          <YAxis />
        </XYPlot>
        <ReactResizeDetector handleWidth={true} onResize={this.resize} />
      </div>
    )
  }
}

export default withStyles({}, { withTheme: true })(PlotHistory)
