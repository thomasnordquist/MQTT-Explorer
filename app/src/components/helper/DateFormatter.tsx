import * as React from 'react'
import * as moment from 'moment'

interface Props {
  date: Date
}

class DateFormatter extends React.Component<Props, {}> {
  public render() {
    const momentObject = this.localizedMoment()
    return <span>{momentObject.format('L')} {momentObject.format('LTS')}</span>
  }

  private getLocale() {
    return window.navigator.language
  }

  private localizedMoment() {
    return moment(this.props.date).locale(this.getLocale())
  }
}

export default DateFormatter
