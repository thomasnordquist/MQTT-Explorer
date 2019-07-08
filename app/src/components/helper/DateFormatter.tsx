import * as moment from 'moment'
import * as React from 'react'
import { AppState } from '../../reducers'
import { connect } from 'react-redux'

interface Props {
  date: Date
  overrideLocale?: string
  locale?: string
  intervalSince?: Date
}

const unitMapping = {
  s: 'seconds',
  m: 'minutes',
  h: 'hours',
}

class DateFormatter extends React.PureComponent<Props, {}> {
  private intervalSince(intervalSince: Date) {
    const interval = intervalSince.getTime() - this.props.date.getTime()
    const unit = this.unitForInterval(interval)
    return `${Math.round(moment.duration(interval).as(unit) * 100) / 100} ${unitMapping[unit]}`
  }

  private legacyDate() {
    return `${this.props.date.toLocaleDateString()} ${this.props.date.toLocaleTimeString()}`
  }

  private localizedDate(locale: string) {
    return moment(this.props.date)
      .locale(locale)
      .format('L LTS')
  }

  private unitForInterval(milliseconds: number) {
    const oneMinute = 1000 * 60
    const oneHour = oneMinute * 60

    if (milliseconds > oneHour * 2) {
      return 'h'
    }

    if (milliseconds > oneMinute * 2) {
      return 'm'
    }

    return 's'
  }

  public render() {
    const locale = this.props.overrideLocale || this.props.locale
    if (this.props.intervalSince) {
      return <span>{this.intervalSince(this.props.intervalSince)}</span>
    }
    return <span>{locale ? this.localizedDate(locale) : this.legacyDate()}</span>
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    locale: state.settings.get('timeLocale'),
  }
}

export default connect(mapStateToProps)(DateFormatter)
