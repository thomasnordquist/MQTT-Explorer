import React, { memo } from 'react'
import { alpha as fade, useTheme } from '@mui/material/styles'
import { Fade, Grow, Paper, Popper, Typography } from '@mui/material'
import { Tooltip } from './Model'

function TooltipComponent(props: { tooltip?: Tooltip }) {
  const theme = useTheme()
  const { tooltip } = props
  return (
    <Popper
      style={tooltip ? { transition: 'all 0.1s ease-out' } : undefined}
      open={Boolean(tooltip)}
      transition
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
