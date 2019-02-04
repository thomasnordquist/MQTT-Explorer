import * as React from 'react'

import { Snackbar, SnackbarContent, ListItemText, ListSubheader } from '@material-ui/core'
import { Theme, withStyles } from '@material-ui/core/styles'
import { green, red } from '@material-ui/core/colors'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Connection from './Connection'
interface Props {
  classes: any
}

class ProfileList extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  public render() {
    return (
      <List
        component="nav"
        subheader={<ListSubheader component="div">Connections</ListSubheader>}
      >
      Huhu
      </List>
    )
  }
}

const ConnectionItem = (props: {}) => {
  return (
    <ListItem
      button={true}
    >
      {/* <ListItemText primary={{connectionName}} /> */}
    </ListItem>
  )
}

const styles = (theme: Theme) => ({
})

export default withStyles(styles)(ProfileList)
