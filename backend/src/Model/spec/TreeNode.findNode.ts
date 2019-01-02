import { TreeNode } from  '../'
declare module  '../' {
    interface TreeNode {
        findNode(path: String): TreeNode | undefined
    }
}

TreeNode.prototype.findNode = function(path: String): TreeNode | undefined {
  const topics = path.split('/')
  let edge = this.edges[topics[0]]
  let remainingTopics = topics.slice(1, topics.length)
  if (edge && remainingTopics.length === 0) {
    return edge.target
  } else if (edge) {
    return edge.target.findNode(remainingTopics.join('/'))
  }

  return undefined
}
