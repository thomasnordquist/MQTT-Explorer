import { blueGrey } from '@mui/material/colors'
import { Theme } from '@mui/material/styles'

export const styles = (theme: Theme) => ({
  animationLight: {
    willChange: 'auto',
    translateZ: 0,
    animation: 'updateLight 0.5s',
  },
  animationDark: {
    willChange: 'auto',
    translateZ: 0,
    animation: 'updateDark 0.5s',
  },
  collapsedSubnodes: {
    color: theme.palette.text.secondary,
  },
  displayBlock: {
    display: 'block' as const,
  },
  node: {
    display: 'block' as const,
    width: '100%',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
    padding: '1px 0px 0px 0px',
  },
  topicSelect: {
    float: 'right' as const,
    opacity: 0,
    cursor: 'pointer',
    marginTop: '-1px',
  },
  subnodes: {
    marginLeft: theme.spacing(1.5),
  },
  selected: {
    backgroundColor: `${theme.palette.mode === 'light' ? blueGrey[300] : theme.palette.primary.main} !important`,
  },
  hover: {},
  title: {
    borderRadius: '4px',
    lineHeight: '1em',
    display: 'inline-block' as const,
    whiteSpace: 'nowrap' as const,
    height: '14px',
    padding: '1px 4px 0 4px',
    margin: '1px 0px',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' ? blueGrey[100] : theme.palette.primary.light,
    },
  },
})
