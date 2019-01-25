import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { Typography } from '@material-ui/core'
import { TopicViewModel } from '../../TopicViewModel'

interface Props {
  node: q.TreeNode<TopicViewModel>
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
        <Typography>Subtopics: {node.childTopicCount()}</Typography>
        <Typography>Messages Subtopics: #{node.leafMessageCount()}</Typography>
      </div>
    )
  }
}

export default NodeStats
