import * as React from 'react'
import * as moment from 'moment'

interface Props {
  date: Date
}

class DateFormatter extends React.Component<Props, {}> {
  public render() {
    const locale = window.navigator.language
    return <span>{locale ? this.localizedDate(locale) : this.legacyDate()}</span>
  }

  private legacyDate() {
    return `${this.props.date.toLocaleDateString()} ${this.props.date.toLocaleTimeString()}`
  }

  private localizedDate(locale: string) {
    return moment(this.props.date).locale(locale).format('L LTS')
  }
}

export default DateFormatter
