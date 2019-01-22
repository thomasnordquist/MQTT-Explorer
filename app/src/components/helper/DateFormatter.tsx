import * as React from 'react'

interface Props {
  date: Date
}

class DateFormatter extends React.Component<Props, {}> {

  public render() {
    return <span>{this.props.date.toLocaleDateString()} {this.props.date.toLocaleTimeString()}</span>
  }
}

export default DateFormatter
