import * as React from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import InfoIcon from '@mui/icons-material/Info'
import SendIcon from '@mui/icons-material/Send'
import ShowChartIcon from '@mui/icons-material/ShowChart'

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
        aria-label="Topics, Details, Publish and Charts tabs"
      >
        <Tab
          icon={<AccountTreeIcon />}
          label="Topics"
          data-testid="mobile-tab-topics"
          aria-label="View topics tree"
          id="mobile-tab-0"
          aria-controls="mobile-tabpanel-0"
        />
        <Tab
          icon={<InfoIcon />}
          label="Details"
          data-testid="mobile-tab-details"
          aria-label="View topic details"
          id="mobile-tab-1"
          aria-controls="mobile-tabpanel-1"
        />
        <Tab
          icon={<SendIcon />}
          label="Publish"
          data-testid="mobile-tab-publish"
          aria-label="Publish messages"
          id="mobile-tab-2"
          aria-controls="mobile-tabpanel-2"
        />
        <Tab
          icon={<ShowChartIcon />}
          label="Charts"
          data-testid="mobile-tab-charts"
          aria-label="View charts"
          id="mobile-tab-3"
          aria-controls="mobile-tabpanel-3"
        />
      </Tabs>
    </Box>
  )
}

const styles = (theme: Theme) => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    position: 'relative' as const,
    zIndex: 1,
    minHeight: '56px', // Touch-friendly tab height
    '& .MuiTab-root': {
      minHeight: '56px', // 48px minimum + padding
      fontSize: '16px', // Prevent iOS zoom
      fontWeight: 500,
      padding: theme.spacing(1.5, 2),
      textTransform: 'none' as const, // Better readability
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
