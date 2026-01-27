import React from 'react'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography, Theme } from '@mui/material'
import { withStyles } from '@mui/styles'

const styles = (theme: Theme) => ({
  summary: { minHeight: '0' },
  details: { padding: '0px 16px 8px 8px', display: 'block' },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
})

function Panel(props: {
  classes: any
  children: [React.ReactElement, React.ReactElement]
  disabled?: boolean
  detailsHidden?: boolean
}) {
  return (
    <Accordion defaultExpanded disabled={props.disabled}>
      <AccordionSummary expandIcon={<ExpandMore />} className={props.classes.summary}>
        <Typography className={props.classes.heading}>{props.children[0]}</Typography>
      </AccordionSummary>
      {props.detailsHidden ? null : (
        <AccordionDetails className={props.classes.detail}>{props.children[1]}</AccordionDetails>
      )}
    </Accordion>
  )
}

// @ts-ignore
export default withStyles(styles)(Panel)
