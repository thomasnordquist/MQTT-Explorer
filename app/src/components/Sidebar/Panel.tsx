import React from 'react'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography, Theme } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = (theme: Theme) => ({
  summary: { minHeight: '0' },
  details: { padding: '0px 16px 8px 8px', display: 'block' },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
})

const Panel = (props: {
  classes: any
  children: [React.ReactElement, React.ReactElement]
  disabled?: boolean
  detailsHidden?: boolean
}) => {
  return (
    <ExpansionPanel defaultExpanded={true} disabled={props.disabled}>
      <ExpansionPanelSummary expandIcon={<ExpandMore />} className={props.classes.summary}>
        <Typography className={props.classes.heading}>{props.children[0]}</Typography>
      </ExpansionPanelSummary>
      {props.detailsHidden ? null : (
        <ExpansionPanelDetails className={props.classes.detail}>{props.children[1]}</ExpansionPanelDetails>
      )}
    </ExpansionPanel>
  )
}

// @ts-ignore
export default withStyles(styles)(Panel)
