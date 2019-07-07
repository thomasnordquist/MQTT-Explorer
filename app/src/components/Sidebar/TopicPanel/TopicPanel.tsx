import * as q from '../../../../../backend/src/Model'
import Copy from '../../helper/Copy'
import Panel from '../Panel'
import React, { useMemo } from 'react'
import Topic from './Topic'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { RecursiveTopicDeleteButton } from './RecursiveTopicDeleteButton'
import { sidebarActions } from '../../../actions'
import { TopicDeleteButton } from './TopicDeleteButton'

const TopicPanel = (props: { node?: q.TreeNode<any>; actions: typeof sidebarActions; updateNode: () => void }) => {
  const { node, updateNode } = props
  const copyTopic = node ? <Copy value={node.path()} /> : null

  const deleteTopic = (topic?: q.TreeNode<any>, recursive: boolean = false, maxCount = 50) => {
    if (!topic) {
      return
    }

    props.actions.clearTopic(topic, recursive, maxCount)
  }

  return useMemo(
    () => (
      <Panel disabled={!Boolean(node)}>
        <span>
          Topic {copyTopic}
          <TopicDeleteButton node={node} deleteTopicAction={deleteTopic} />
          <RecursiveTopicDeleteButton node={node} deleteTopicAction={deleteTopic} />
        </span>
        <Topic node={node} didSelectNode={updateNode} />
      </Panel>
    ),
    [node, node && node.childTopicCount()]
  )
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(sidebarActions, dispatch),
  }
}

export default connect(
  undefined,
  mapDispatchToProps
)(TopicPanel)
