import { Hashable, TreeNode, TopicProperties } from './'
const sha1 = require('sha1')

export class Edge {
  public name: string

  public node!: TreeNode
  public source: TreeNode | undefined
  public target: TreeNode | undefined

  constructor(name: string) {
    this.name = name
  }

  public edges() {
    return this.node ? Object.values(this.node.edges) : []
  }

  public hash(): string {
    let previousHash = this.source ? this.source.sourceEdge.hash() : ''
    return 'H' + sha1(previousHash + this.name)
  }

  public firstEdge(): Edge {
    if (this.source) {
      return this.source.sourceEdge.firstEdge()
    } else {
      return this
    }
  }
}
