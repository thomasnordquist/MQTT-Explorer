import * as dotProp from 'dot-prop'
import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import PlotHistory from './PlotHistory'
import { Base64Message } from '../../../../backend/src/Model/Base64Message'
import { toPlottableValue } from './CodeDiff/util'

interface Props {
  history: q.MessageHistory
  dotPath?: string
}

function nodeToHistory(history: q.MessageHistory) {
  return history
    .toArray()
    .map((message: q.Message) => {
      const value = message.value ? toPlottableValue(Base64Message.toUnicodeString(message.value)) : NaN
      return { x: message.received.getTime(), y: toPlottableValue(value) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function nodeDotPathToHistory(history: q.MessageHistory, dotPath: string) {
  return history
    .toArray()
    .map((message: q.Message) => {
      let json = {}
      try {
        json = message.value ? JSON.parse(Base64Message.toUnicodeString(message.value)) : {}
      } catch (ignore) {}

      let value = dotProp.get(json, dotPath)

      return { x: message.received.getTime(), y: toPlottableValue(value) }
    })
    .filter(data => !isNaN(data.y as any)) as any
}

function render(props: Props) {
  const data = props.dotPath ? nodeDotPathToHistory(props.history, props.dotPath) : nodeToHistory(props.history)
  console.log(props.dotPath, data)
  return <PlotHistory data={data} />
}

export default render
