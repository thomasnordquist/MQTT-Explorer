import { css } from '@emotion/css'
import { Theme, useTheme } from '@mui/material/styles'
import * as React from 'react'

type StyleRecord = Record<string, object>
type StylesInput = StyleRecord | ((theme: Theme) => StyleRecord)

export function withStyles<ClassKey extends string, Props extends { classes: Record<ClassKey, string> }>(
  styles: StylesInput,
  options?: { withTheme?: boolean }
) {
  return (Component: React.ComponentType<Props>) => {
    const WithStyles = (props: Omit<Props, 'classes' | 'theme'>) => {
      const theme = useTheme()
      const styleMap = typeof styles === 'function' ? styles(theme) : styles
      const classes = Object.fromEntries(Object.entries(styleMap).map(([key, style]) => [key, css(style)])) as Record<
        ClassKey,
        string
      >

      if (options?.withTheme) {
        return <Component {...(props as Props)} classes={classes} theme={theme} />
      }

      return <Component {...(props as Props)} classes={classes} />
    }

    WithStyles.displayName = `WithStyles(${Component.displayName || Component.name || 'Component'})`
    return WithStyles
  }
}
