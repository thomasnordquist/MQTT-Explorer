import { Destroyable, MemoryLifecycle } from './Destroyable'
import { Hashable, TreeNode } from './'
const sha1 = require('sha1')

export class Edge<ViewModel extends Destroyable & MemoryLifecycle> implements Hashable {
  public name: string

  public target!: TreeNode<ViewModel>
  public source?: TreeNode<ViewModel> | undefined
  private cachedHash?: string

  constructor(name: string) {
    this.name = name
  }

  public edges(): Array<Edge<ViewModel>> {
    return this.target ? this.target.edgeArray : []
  }

  public hash(): string {
    if (!this.cachedHash) {
      let previousHash
      if (this.source && this.source.sourceEdge) {
        previousHash = this.source.sourceEdge.hash()
      } else {
        // Use the tree hash to distinguish between different trees
        previousHash = this.source && this.source.isTree ? (this.source as any).hash() : ''
      }

      this.cachedHash = `H${sha1(previousHash + this.name)}`
    }

    return this.cachedHash
  }

  public firstEdge(): Edge<ViewModel> {
    if (this.source && this.source.sourceEdge) {
      return this.source.sourceEdge.firstEdge()
    }

    return this
  }
}
