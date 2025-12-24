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
    <Box className={props.classes.root}>
      <Tabs 
        value={props.value} 
        onChange={handleChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Topics" data-testid="mobile-tab-topics" />
        <Tab label="Details" data-testid="mobile-tab-details" />
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
  },
})

export default withStyles(styles)(MobileTabs)
