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

function nodeToHistory(startTime: number | undefined, history: q.MessageHistory, node: q.TreeNode<any>) {
  return filterUsingTimeRange(startTime, history.toArray())
    .map((message: q.Message) => {
      const decoded = node.decodeMessage(message)?.toUnicodeString()
      return { x: message.received.getTime(), y: toPlottableValue(decoded) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function nodeDotPathToHistory(
  startTime: number | undefined,
  history: q.MessageHistory,
  dotPath: string,
  node: q.TreeNode<any>
) {
  return filterUsingTimeRange(startTime, history.toArray())
    .map((message: q.Message) => {
      let json: any = {}
      try {
        const decoded = node.decodeMessage(message)
        json = decoded ? JSON.parse(decoded.toUnicodeString()) : {}
      } catch (ignore) {}

      const value = dotProp.get(json, dotPath)

      return { x: message.received.getTime(), y: toPlottableValue(value) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function TopicPlot(props: Props) {
  const startOffset = props.timeInterval ? parseDuration(props.timeInterval) : undefined
  const data = React.useMemo(() => {
    if (!props.node) {
      return []
    }

    return props.dotPath
      ? nodeDotPathToHistory(startOffset, props.history, props.dotPath, props.node)
      : nodeToHistory(startOffset, props.history, props.node)
  }, [props.history.last(), startOffset, props.dotPath])

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
