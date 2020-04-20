import React, { memo } from 'react'
import { Message } from '../../../../backend/src/Model'
import { Tooltip } from '@material-ui/core'

export const MessageId = memo(function MessageId(props: { message: Message; addComma?: boolean }) {
  const { message, addComma } = props

  if (!message.messageId) {
    return null
  }

  return (
    <Tooltip title="MessageIds are used to signal a successful transmission of a message.">
      <span>
        #msg: {message.messageId}
        {addComma ? ', ' : ''}
      </span>
    </Tooltip>
  )
})
