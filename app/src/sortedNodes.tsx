import * as q from 'mqtt-explorer-backend/src/Model/Model'
import { SettingsState, TopicOrder } from './reducers/Settings'
import { TopicViewModel } from './model/TopicViewModel'

export function sortedNodes(settings: SettingsState, treeNode: q.TreeNode<any>): Array<q.TreeNode<TopicViewModel>> {
  const topicOrder = settings.get('topicOrder')
  const edges = [...treeNode.edgeArray]

  if (topicOrder === TopicOrder.abc) {
    edges.sort((a, b) => a.name.localeCompare(b.name))
  }
  const nodes = edges.map(edge => edge.target)
  if (topicOrder === TopicOrder.messages) {
    nodes.sort((a, b) => b.leafMessageCount() - a.leafMessageCount())
  }
  if (topicOrder === TopicOrder.topics) {
    nodes.sort((a, b) => b.childTopicCount() - a.childTopicCount())
  }
  return nodes
}
