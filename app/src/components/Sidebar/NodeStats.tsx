import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Typography } from '@material-ui/core'

interface Props {
  node: q.TreeNode
}

class NodeStats extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
  }

  public render() {
    const { node } = this.props

    return (
      <div>
        <Typography>Messages: #{node.messages}</Typography>
        <Typography>Subtopics: {node.leafCount()}</Typography>
        <Typography>Messages Subtopics: #{node.leafMessageCount()}</Typography>
      </div>
    )
  }
}

export default NodeStats
