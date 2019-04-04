import * as React from 'react'
import * as moment from 'moment'

interface Props {
  date: Date
  intervalSince?: Date
}

const unitMapping = {
  s: 'seconds',
  m: 'minutes',
  h: 'hours',
}

class DateFormatter extends React.Component<Props, {}> {

  private intervalSince(intervalSince: Date) {
    const interval = intervalSince.getTime() - this.props.date.getTime()
    const unit = this.unitForInterval(interval)
    return `${moment.duration(interval).as(unit)} ${unitMapping[unit]}`
  }

  private legacyDate() {
    return `${this.props.date.toLocaleDateString()} ${this.props.date.toLocaleTimeString()}`
  }

  private localizedDate(locale: string) {
    return moment(this.props.date).locale(locale).format('L LTS')
  }

  private unitForInterval(millis: number) {
    const oneMinute = 1000 * 60
    const oneHour = oneMinute * 60

    if (millis > oneHour * 2) {
      return 'h'
    }

    if (millis > oneMinute * 2) {
      return 'm'
    }

    return 's'
  }
  public render() {
    const locale = window.navigator.language
    if (this.props.intervalSince) {
      return <span>{this.intervalSince(this.props.intervalSince)}</span>
    }
    return <span>{locale ? this.localizedDate(locale) : this.legacyDate()}</span>
  }
}

export default DateFormatter
