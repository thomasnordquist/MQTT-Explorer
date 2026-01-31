import * as dotProp from 'dot-prop'
import * as React from 'react'
import * as q from '../../../backend/src/Model'
import PlotHistory from './Chart/Chart'
import { toPlottableValue } from './Sidebar/CodeDiff/util'
import { PlotCurveTypes } from '../reducers/Charts'
import { DecoderFunction, useDecoder } from './hooks/useDecoder'

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

function nodeToHistory(decodeMessage: DecoderFunction, startTime: number | undefined, history: q.MessageHistory) {
  return filterUsingTimeRange(startTime, history.toArray())
    .map((message: q.Message) => {
      const decoded = decodeMessage(message)?.message?.toUnicodeString()
      return { x: message.received.getTime(), y: toPlottableValue(decoded) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function nodeDotPathToHistory(
  decodeMessage: DecoderFunction,
  startTime: number | undefined,
  history: q.MessageHistory,
  dotPath: string
) {
  return filterUsingTimeRange(startTime, history.toArray())
    .map((message: q.Message) => {
      let json: any = {}
      try {
        const decoded = decodeMessage(message)?.message
        json = decoded ? JSON.parse(decoded.toUnicodeString()) : {}
      } catch (ignore) {}

      const value = dotProp.get(json, dotPath)

      return { x: message.received.getTime(), y: toPlottableValue(value) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function TopicPlot(props: Props) {
  const decodeMessage = useDecoder(props.node)
  const startOffset = props.timeInterval ? parseDuration(props.timeInterval) : undefined
  const data = React.useMemo(() => {
    if (!props.node) {
      return []
    }

    return props.dotPath
      ? nodeDotPathToHistory(decodeMessage, startOffset, props.history, props.dotPath)
      : nodeToHistory(decodeMessage, startOffset, props.history)
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
