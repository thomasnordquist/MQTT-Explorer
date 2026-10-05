import { Theme } from '@mui/material'
import { CodeBlockColors, CodeBlockColorsBraceMonokai } from '../CodeBlockColors'

export const style = (theme: Theme) => {
  const codeBlockColors = theme.palette.mode === 'light' ? CodeBlockColors : CodeBlockColorsBraceMonokai
  const codeBaseStyle = {
    font: "12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
    display: 'inline-grid' as const,
    margin: '0',
    padding: '1px 0 0 0',
  }

  return {
    title: {
      font: codeBaseStyle.font,
      paddingLeft: '4px',
      backgroundColor: codeBlockColors.gutters,
    },
    line: {
      lineHeight: 'normal' as const,
      paddingLeft: '4px',
      width: '100%',
      height: '16px',
    },
    codeWrapper: {
      display: 'flex',
      height: '15em',
      minHeight: '5em',
      overflow: 'auto',
      backgroundColor: `${codeBlockColors.background}`,
    },
    resizeHandle: {
      height: '8px',
      cursor: 'ns-resize',
      backgroundColor: codeBlockColors.gutters,
      borderTop: '1px solid rgba(128, 128, 128, 0.4)',
      backgroundImage:
        'linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7))',
      backgroundSize: '30px 1px',
      backgroundPosition: 'center 2px, center 5px',
      backgroundRepeat: 'no-repeat',
      '&:hover': {
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
      },
    },
    gutters: {
      ...codeBaseStyle,
      width: '33px',
      backgroundColor: codeBlockColors.gutters,
      userSelect: 'none' as const,
    },
    codeBlock: {
      ...codeBaseStyle,
      width: 'calc(100% - 33px)',
      backgroundColor: 'inherit !important',
      '& span': {
        color: codeBlockColors.text,
      },
      '& .token.number': {
        color: codeBlockColors.numeric,
      },
      '& .token.boolean': {
        color: codeBlockColors.numeric,
      },
      '& .token.property': {
        color: codeBlockColors.variable,
      },
      '& .token.string': {
        color: codeBlockColors.string,
      },
      '& .token': {
        color: codeBlockColors.text,
      },
      '& .token.operator': {
        color: codeBlockColors.text,
      },
      '& .token.punctuation': {
        color: codeBlockColors.text,
      },
    },
  }
}
