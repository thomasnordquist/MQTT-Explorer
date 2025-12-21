import React, { memo } from 'react'
import { fade } from '@mui/material/styles'
import { Fade, Grow, Paper, Popper, Theme, Typography, withTheme } from '@mui/material'
import { Tooltip } from './Model'

function TooltipComponent(props: { tooltip?: Tooltip; theme: Theme }) {
  const { tooltip } = props
  return (
    <Popper
      style={Boolean(tooltip) ? { transition: 'all 0.1s ease-out' } : undefined}
      open={Boolean(tooltip)}
      transition={true}
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
                  props.theme.palette.mode === 'light'
                    ? props.theme.palette.background.paper
                    : props.theme.palette.background.default,
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

export default withTheme(memo(TooltipComponent))
