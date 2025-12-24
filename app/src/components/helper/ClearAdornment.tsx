import * as React from 'react'
import Clear from '@mui/icons-material/Clear'
import { IconButton, Theme } from '@mui/material'
import { useTheme } from '@mui/material/styles'

interface Props {
  value?: string
  action: any
  style?: React.CSSProperties
  variant?: 'primary'
}

/**
 * Clear button for text input fields
 */
function ClearAdornment(props: Props) {
  const theme = useTheme()

  if (!props.value) {
    return null
  }

  const color = props.variant === 'primary' ? theme.palette.primary.contrastText : undefined
  return (
    <IconButton style={{ ...props.style, padding: '1px' }} onClick={props.action}>
      <Clear style={{ color, fontSize: '16px' }} />
    </IconButton>
  )
}

export default ClearAdornment
