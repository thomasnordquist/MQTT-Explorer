import { Hashable, TreeNode } from './'
const sha1 = require('sha1')

export class Edge implements Hashable {
  public name: string

  public target!: TreeNode
  public source?: TreeNode | undefined
  private cachedHash?: string

  constructor(name: string) {
    this.name = name
  }

  public edges() {
    return this.target ? Object.values(this.target.edges) : []
  }

  public hash(): string {
    if (!this.cachedHash) {
      let previousHash = (this.source && this.source.sourceEdge) ? this.source.sourceEdge.hash() : ''
      this.cachedHash = 'H' + sha1(previousHash + this.name)
    }

    return this.cachedHash
  }

  public firstEdge(): Edge {
    if (this.source && this.source.sourceEdge) {
      return this.source.sourceEdge.firstEdge()
    } else {
      return this
    }
  }
}
