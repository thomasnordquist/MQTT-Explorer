import React, { memo } from 'react'
import { alpha as fade, useTheme } from '@mui/material/styles'
import { Fade, Grow, Paper, Popper, Typography } from '@mui/material'
import { Tooltip } from './Model'

function TooltipComponent(props: { tooltip?: Tooltip }) {
  const theme = useTheme()
  const { tooltip } = props

  // Note: Popper's `transition` prop must not be used here. It requires a render-function child
  // that wires up TransitionProps; with plain JSX children Popper never leaves its "exited" state
  // and never positions itself. The Fade/Grow below provide the enter animation instead.
  // Popper re-measures the anchor on every render, so a virtual anchor that follows the pointer
  // is picked up automatically.
  return (
    <Popper
      style={{ pointerEvents: 'none', ...(tooltip ? { transition: 'all 0.1s ease-out' } : {}) }}
      open={Boolean(tooltip)}
      placement="top"
      anchorEl={tooltip && tooltip.element}
    >
      <div
        style={{
          paddingBottom: '8px',
          transition: 'all 0.5s ease',
        }}
      >
        <Fade in={Boolean(tooltip)} timeout={300}>
          <Grow in={Boolean(tooltip)} timeout={300}>
            <Paper
              style={{
                padding: '4px',
                marginTop: '-12px',
                backgroundColor: fade(
                  theme.palette.mode === 'light' ? theme.palette.background.paper : theme.palette.background.default,
                  0.7
                ),
              }}
            >
              <table style={{ lineHeight: '1.25em' }}>
                <tbody>
                  {tooltip &&
                    tooltip.value.map((v: any, idx: number) => (
                      <tr key={idx}>
                        <td>
                          <Typography style={{ lineHeight: '1.2' }}>{v.title}</Typography>
                        </td>
                        <td>
                          <Typography style={{ lineHeight: '1.2' }}>{v.value}</Typography>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Paper>
          </Grow>
        </Fade>
      </div>
    </Popper>
  )
}

export default memo(TooltipComponent)
