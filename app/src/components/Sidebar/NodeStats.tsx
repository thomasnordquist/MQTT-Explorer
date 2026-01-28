import * as React from 'react'
import { Typography } from '@mui/material'
import * as q from '../../../../backend/src/Model'
import { TopicViewModel } from '../../model/TopicViewModel'

interface Props {
  node?: q.TreeNode<TopicViewModel>
}

class NodeStats extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
  }

  public render() {
    const { node } = this.props
    if (!node) {
      return null
    }

    return (
      <div>
        <Typography>Messages: #{node.messages}</Typography>
        <Typography>
          Subtopics:
          {node.childTopicCount()}
        </Typography>
        <Typography>Messages Subtopics: #{node.leafMessageCount()}</Typography>
      </div>
    )
  }
}

export default NodeStats
