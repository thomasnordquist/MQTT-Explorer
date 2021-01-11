import React, { useCallback } from 'react'
import * as q from '../../../../../backend/src/Model'
import CustomIconButton from '../../helper/CustomIconButton'
import Code from '@material-ui/icons/Code'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'

const options: q.TopicDataType[] = ['string', 'json', 'hex', 'integer', 'unsigned int', 'floating point'];

export const TopicTypeButton = (props: {
  node?: q.TreeNode<any>
  setTopicType: (node: q.TreeNode<any>, type: q.TopicDataType) => void
}) => {
  const { node } = props
  if (!node || !node.message || !node.message.payload) {
    return null
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [open, setOpen] = React.useState(false)

  const handleMenuItemClick = useCallback(
    (mouseEvent: React.MouseEvent, element: q.TreeNode<any>, type: q.TopicDataType) => {
      if (!element || !type) {
        return
      }
      props.setTopicType(element, type as q.TopicDataType)
      setOpen(false)
    },
    [props.setTopicType]
  )

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    if (open === true) {
      return
    }
    setAnchorEl(event.currentTarget)
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorEl && anchorEl.contains(event.target as HTMLElement)) {
      return
    }
    setOpen(false)
  }

  return (
    <CustomIconButton tooltip="" onClick={handleToggle}>
      <Code />
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
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={node && option === node.type}
                      onClick={(event) => handleMenuItemClick(event, node, option)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </CustomIconButton>
  )
}