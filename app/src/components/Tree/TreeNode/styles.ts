import { blueGrey } from '@material-ui/core/colors'
import { Theme } from '@material-ui/core/styles'

export const styles = (theme: Theme) => {
  return {
    animationLight: {
      willChange: 'auto',
      translateZ: 0,
      animation: `updateLight 0.5s`,
    },
    animationDark: {
      willChange: 'auto',
      translateZ: 0,
      animation: `updateLight 0.5s`,
    },
    collapsedSubnodes: {
      color: theme.palette.text.secondary,
    },
    displayBlock: {
      display: 'block',
    },
    node: {
      display: 'block',
      marginLeft: '10px',
      '&:hover': {
        backgroundColor: theme.palette.type === 'light' ? blueGrey[100] : theme.palette.primary.light,
      },
    },
    topicSelect: {
      float: 'right' as 'right',
      opacity: 0,
      cursor: 'pointer',
      marginTop: '-1px',
    },
    subnodes: {
      marginLeft: theme.spacing(1.5),
    },
    selected: {
      backgroundColor: (theme.palette.type === 'light' ? blueGrey[300] : theme.palette.primary.main) + ' !important',
    },
    hover: {},
    title: {
      borderRadius: '4px',
      lineHeight: '1em',
      display: 'inline-block' as 'inline-block',
      whiteSpace: 'nowrap' as 'nowrap',
      padding: '1px 4px 0px 4px',
      height: '14px',
      margin: '1px 0px 2px 0px',
    },
  }
}
