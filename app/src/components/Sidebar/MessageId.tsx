import React, { memo } from 'react'
import { Tooltip } from '@mui/material'
import { Message } from '../../../../backend/src/Model'

export const MessageId = memo((props: { message: Message; addComma?: boolean }) => {
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
