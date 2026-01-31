import React, { useCallback, useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Message from './Model/Message'
import History from '../HistoryDrawer'
import { publishActions } from '../../../actions'

const sha1 = require('sha1')

function PublishHistory(props: { history: Array<Message>; actions: typeof publishActions }) {
  const didSelectHistoryEntry = useCallback(
    (index: number) => {
      const items = [...props.history].reverse()
      const message = items[index]
      props.actions.setTopic(message.topic)
      props.actions.setPayload(message.payload)
    },
    [props.history]
  )

  return useMemo(() => {
    const items = [...props.history].reverse().map(message => ({
      key: sha1(message.topic + message.payload),
      title: message.topic,
      value: message.payload || '',
    }))

    return <History autoOpen items={items} onClick={didSelectHistoryEntry} />
  }, [props.history])
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(publishActions, dispatch),
})

export default connect(undefined, mapDispatchToProps)(PublishHistory)
