import React, { useCallback, useMemo } from 'react'
import * as q from '../../../../../backend/src/Model'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import WarningRounded from '@material-ui/icons/WarningRounded'
import { IDecoder, decoders } from '../../../../../backend/src/Model/sparkplugb'
import { Tooltip } from '@material-ui/core'

export const TopicTypeButton = (props: { node?: q.TreeNode<any> }) => {
  const { node } = props
  if (!node || !node.message || !node.message.payload) {
    return null
  }

  const options = decoders.flatMap(decoder => decoder.formats.map(format => [decoder, format] as const))

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [open, setOpen] = React.useState(false)

  const selectOption = useCallback(
    (decoder: IDecoder, format: string) => {
      if (!node) {
        return
      }

      node.viewModel.decoder = { decoder, format }
      setOpen(false)
    },
    [node]
  )

  const handleToggle = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation()
      if (open === true) {
        return
      }
      setAnchorEl(event.currentTarget)
      setOpen(prevOpen => !prevOpen)
    },
    [open]
  )

  const handleClose = useCallback((event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorEl && anchorEl.contains(event.target as HTMLElement)) {
      return
    }
    setOpen(false)
  }, [])

  return (
    <Button onClick={handleToggle}>
      {props.node?.viewModel.decoder?.format ?? props.node?.type}
      <Popper open={open} anchorEl={anchorEl} role={undefined} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="topicTypeMode">
                  {options.map(([decoder, format], index) => (
                    <MenuItem
                      key={format}
                      selected={node && format === node.type}
                      onClick={() => selectOption(decoder, format)}
                    >
                      <DecoderStatus decoder={decoder} format={format} node={node} />
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Button>
  )
}

function DecoderStatus({ node, decoder, format }: { node: q.TreeNode<any>; decoder: IDecoder; format: string }) {
  const decoded = useMemo(() => {
    return node.message?.payload && decoder.decode(node.message?.payload, format)
  }, [node.message, decoder, format])

  return decoded?.error ? (
    <Tooltip title={decoded.error}>
      <div>
        {format} <WarningRounded />
      </div>
    </Tooltip>
  ) : (
    <>{format}</>
  )
}
