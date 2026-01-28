import React, { useCallback, useMemo } from 'react'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import WarningRounded from '@mui/icons-material/WarningRounded'
import { Tooltip } from '@mui/material'
import * as q from '../../../../../backend/src/Model'
import { MessageDecoder, decoders } from '../../../decoders'

export function TopicTypeButton(props: { node?: q.TreeNode<any> }) {
  const { node } = props
  if (!node || !node.message || !node.message.payload) {
    return null
  }

  const options = decoders.flatMap(decoder => decoder.formats.map(format => [decoder, format] as const))

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [open, setOpen] = React.useState(false)

  const selectOption = useCallback(
    (decoder: MessageDecoder, format: string) => {
      if (!node || !node.viewModel) {
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

  const handleClose = useCallback((event: any) => {
    if (anchorEl && anchorEl.contains(event.target as HTMLElement)) {
      return
    }
    setOpen(false)
  }, [])

  return (
    <Button onClick={handleToggle}>
      {props.node?.viewModel?.decoder?.format ?? props.node?.type}
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

function DecoderStatus({ node, decoder, format }: { node: q.TreeNode<any>; decoder: MessageDecoder; format: string }) {
  const decoded = useMemo(
    () => node.message?.payload && decoder.decode(node.message?.payload, format),
    [node.message, decoder, format]
  )

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
