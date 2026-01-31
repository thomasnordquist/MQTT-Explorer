import React, { useRef, useCallback, memo } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import { ConfirmationRequest } from '../reducers/Global'
import { KeyCodes } from '../utils/KeyCodes'

function ConfirmationDialog(props: { confirmationRequests: Array<ConfirmationRequest> }) {
  const request = props.confirmationRequests[0]
  const yesRef = useRef<HTMLButtonElement>()
  const noRef = useRef<HTMLButtonElement>()
  const arrowKeyHandler = useCallback((event: React.KeyboardEvent) => {
    const isArrowKey = event.keyCode === KeyCodes.arrow_left || event.keyCode === KeyCodes.arrow_right
    if (!isArrowKey) {
      return
    }

    event.stopPropagation()
    if (document.activeElement === noRef.current) {
      yesRef.current && yesRef.current.focus()
    } else {
      noRef.current && noRef.current.focus()
    }
  }, [])

  const confirm = React.useCallback(() => {
    request && request.callback(true)
  }, [request])
  const reject = React.useCallback(() => {
    request && request.callback(false)
  }, [request])

  if (!request) {
    return null
  }

  return (
    <Dialog
      open
      onClose={reject}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      onKeyDown={arrowKeyHandler}
    >
      <DialogTitle id="alert-dialog-title">{request.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" style={{ whiteSpace: 'pre-wrap' }}>
          {request.inquiry}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button ref={yesRef as any} variant="contained" onClick={confirm} color="primary" autoFocus>
          Yes
        </Button>
        <Button ref={noRef as any} variant="contained" onClick={reject} color="secondary" style={{ marginLeft: '8px' }}>
          No
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default memo(ConfirmationDialog)
