import { blueGrey } from '@mui/material/colors'
import { Theme } from '@mui/material/styles'

export const styles = (theme: Theme) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  
  return {
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
      display: 'block' as 'block',
    },
    node: {
      display: 'block' as 'block',
      width: '100%',
      overflow: 'hidden' as 'hidden',
      textOverflow: 'ellipsis' as 'ellipsis',
      whiteSpace: 'nowrap' as 'nowrap',
      padding: isMobile ? '2px 0px' : '1px 0px 0px 0px', // More padding on mobile
    },
    topicSelect: {
      float: 'right' as 'right',
      opacity: 0,
      cursor: 'pointer',
      marginTop: '-1px',
    },
    subnodes: {
      marginLeft: isMobile ? theme.spacing(2) : theme.spacing(1.5), // Increased indentation on mobile
    },
    selected: {
      backgroundColor: (theme.palette.mode === 'light' ? blueGrey[300] : theme.palette.primary.main) + ' !important',
    },
    hover: {},
    title: {
      borderRadius: '4px',
      lineHeight: isMobile ? '1.5em' : '1em', // Better line height on mobile
      display: 'inline-block' as 'inline-block',
      whiteSpace: 'nowrap' as 'nowrap',
      minHeight: isMobile ? '44px' : '14px', // 48px touch target on mobile (with padding)
      height: 'auto' as 'auto',
      padding: isMobile ? '12px 8px' : '1px 4px 0 4px', // Touch-friendly padding on mobile
      margin: '1px 0px',
      fontSize: isMobile ? '16px' : 'inherit', // Prevent iOS zoom on focus
      cursor: 'pointer' as 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'light' ? blueGrey[100] : theme.palette.primary.light,
      },
      // Better touch feedback on mobile
      [theme.breakpoints.down('md')]: {
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      },
    },
  }
}
