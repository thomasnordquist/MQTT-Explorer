import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux'
import { AppState } from '../../reducers'

interface Props {
  date: Date
  timeFirst?: boolean
  overrideLocale?: string
  locale?: string
  intervalSince?: Date
}

const unitMapping = {
  ms: 'milliseconds',
  s: 'seconds',
  m: 'minutes',
  h: 'hours',
}

class DateFormatter extends React.PureComponent<Props, {}> {
  private intervalSince(intervalSince: Date) {
    const interval = intervalSince.getTime() - this.props.date.getTime()
    const unit = this.unitForInterval(interval)
    return `${moment.duration(interval).as(unit).toFixed(3)} ${unitMapping[unit]}`
  }

  private legacyDate() {
    return `${this.props.date.toLocaleDateString()} ${this.props.date.toLocaleTimeString()}`
  }

  private localizedDate(locale: string) {
    return moment(this.props.date)
      .locale(locale)
      .format(this.props.timeFirst ? 'LTS.SSS L' : 'L LTS.SSS')
  }

  private unitForInterval(milliseconds: number) {
    const oneSecond = 1000 * 1
    const oneMinute = 1000 * 60
    const oneHour = oneMinute * 60

    if (milliseconds > oneHour * 2) {
      return 'h'
    }

    if (milliseconds > oneMinute * 2) {
      return 'm'
    }

    if (milliseconds > oneSecond * 0.5) {
      return 's'
    }

    return 'ms'
  }

  public render() {
    const locale = this.props.overrideLocale || this.props.locale
    if (this.props.intervalSince) {
      return <span>{this.intervalSince(this.props.intervalSince)}</span>
    }
    return <span>{locale ? this.localizedDate(locale) : this.legacyDate()}</span>
  }
}

const mapStateToProps = (state: AppState) => ({
  locale: state.settings.get('timeLocale'),
})

export default connect(mapStateToProps)(DateFormatter)
