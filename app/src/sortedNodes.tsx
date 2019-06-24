import * as q from '../../backend/src/Model'
import { SettingsState, TopicOrder } from './reducers/Settings'
import { TopicViewModel } from './model/TopicViewModel'

export function sortedNodes(settings: SettingsState, treeNode: q.TreeNode<any>): Array<q.TreeNode<TopicViewModel>> {
  const topicOrder = settings.get('topicOrder')
  let edges = treeNode.edgeArray
  if (topicOrder === TopicOrder.abc) {
    edges = edges.sort((a, b) => a.name.localeCompare(b.name))
  }
  let nodes = edges.map(edge => edge.target)
  if (topicOrder === TopicOrder.messages) {
    nodes = nodes.sort((a, b) => b.leafMessageCount() - a.leafMessageCount())
  }
  if (topicOrder === TopicOrder.topics) {
    nodes = nodes.sort((a, b) => b.childTopicCount() - a.childTopicCount())
  }
  return nodes
}
