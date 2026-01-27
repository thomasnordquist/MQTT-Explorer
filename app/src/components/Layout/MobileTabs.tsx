import * as React from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

interface Props {
  classes: any
  value: number
  onChange: (value: number) => void
}

function MobileTabs(props: Props) {
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    props.onChange(newValue)
  }

  return (
    <Box className={props.classes.root} role="navigation" aria-label="Mobile navigation tabs">
      <Tabs 
        value={props.value} 
        onChange={handleChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        aria-label="Topics, Details and Publish tabs"
      >
        <Tab 
          label="Topics" 
          data-testid="mobile-tab-topics"
          aria-label="View topics tree"
          id="mobile-tab-0"
          aria-controls="mobile-tabpanel-0"
        />
        <Tab 
          label="Details" 
          data-testid="mobile-tab-details"
          aria-label="View topic details"
          id="mobile-tab-1"
          aria-controls="mobile-tabpanel-1"
        />
        <Tab 
          label="Publish" 
          data-testid="mobile-tab-publish"
          aria-label="Publish messages"
          id="mobile-tab-2"
          aria-controls="mobile-tabpanel-2"
        />
      </Tabs>
    </Box>
  )
}

const styles = (theme: Theme) => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    position: 'relative' as 'relative',
    zIndex: 1,
    minHeight: '56px', // Touch-friendly tab height
    '& .MuiTab-root': {
      minHeight: '56px', // 48px minimum + padding
      fontSize: '16px', // Prevent iOS zoom
      fontWeight: 500,
      padding: theme.spacing(1.5, 2),
      textTransform: 'none' as 'none', // Better readability
      '&:active': {
        opacity: 0.7, // Touch feedback
      },
    },
    '& .MuiTabs-indicator': {
      height: '3px', // Thicker indicator for better visibility
    },
  },
})

export default withStyles(styles)(MobileTabs)
