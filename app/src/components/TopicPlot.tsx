import * as dotProp from 'dot-prop'
import * as q from '../../../backend/src/Model'
import * as React from 'react'
import PlotHistory from './Chart/Chart'
import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { toPlottableValue } from './Sidebar/CodeDiff/util'
import { PlotCurveTypes } from '../reducers/Charts'
const parseDuration = require('parse-duration')

interface Props {
  node?: q.TreeNode<any>
  history: q.MessageHistory
  dotPath?: string
  timeInterval?: string
  interpolation?: PlotCurveTypes
  range?: [number?, number?]
  color?: string
}

function filterUsingTimeRange(startTime: number | undefined, data: Array<q.Message>) {
  if (startTime) {
    const threshold = new Date(Date.now() - startTime)
    return data.filter(d => d.received >= threshold)
  }

  return data
}

function nodeToHistory(startTime: number | undefined, history: q.MessageHistory, type: q.TopicDataType) {
  return filterUsingTimeRange(startTime, history.toArray())
    .map((message: q.Message) => {
      const [value, ignore] = message.payload ? Base64Message.format(message.payload, type) : [NaN, undefined]
      // const value = message.payload ? toPlottableValue(Base64Message.toUnicodeString(message.payload)) : NaN
      return { x: message.received.getTime(), y: toPlottableValue(value) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function nodeDotPathToHistory(startTime: number | undefined, history: q.MessageHistory, dotPath: string, type: q.TopicDataType) {
  return filterUsingTimeRange(startTime, history.toArray())
    .map((message: q.Message) => {
      let json: any = {}
      try {
        json = message.payload ? JSON.parse(Base64Message.toUnicodeString(message.payload)) : {}
      } catch (ignore) { }

      const value = dotProp.get(json, dotPath)

      return { x: message.received.getTime(), y: toPlottableValue(value) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function TopicPlot(props: Props) {
  const startOffset = props.timeInterval ? parseDuration(props.timeInterval) : undefined
  const data = React.useMemo(
    () =>
      props.dotPath
        ? nodeDotPathToHistory(startOffset, props.history, props.dotPath, props.node ? props.node.type : 'string')
        : nodeToHistory(startOffset, props.history, props.node ? props.node.type : 'string'),
    [props.history.last(), startOffset, props.dotPath]
  )

  return (
    <PlotHistory
      timeRangeStart={startOffset}
      color={props.color}
      range={props.range}
      interpolation={props.interpolation}
      data={data}
    />
  )
}

export default TopicPlot
