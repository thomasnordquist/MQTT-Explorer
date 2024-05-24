import * as q from '../../../backend/src/Model'
import { Destroyable, MemoryLifecycle } from '../../../backend/src/Model/Destroyable'
import { MessageDecoder, decoders } from '../decoders'
import { EventDispatcher } from '../../../events'

function findDecoder<T extends Destroyable & MemoryLifecycle>(node: q.TreeNode<T>): TopicDecoder | undefined {
  const decoder = decoders.find(
    decoder =>
      decoder.canDecodeTopic?.(node.path()) || (node.message?.payload && decoder.canDecodeData?.(node.message?.payload))
  )

  return decoder
    ? {
        decoder,
        format: undefined,
      }
    : undefined
}

type TopicDecoder = { decoder: MessageDecoder; format: string | undefined }

export class TopicViewModel implements Destroyable, MemoryLifecycle {
  private selected: boolean
  private expanded: boolean
  private owner: q.TreeNode<TopicViewModel> | undefined
  private _decoder?: TopicDecoder
  /**
   * Reference counter for useViewModel hook
   */
  private referenceCounter = 0
  public selectionChange = new EventDispatcher<void>()
  public expandedChange = new EventDispatcher<void>()
  public onDecoderChange = new EventDispatcher<TopicDecoder | undefined>()

  get decoder(): TopicDecoder | undefined {
    if (!this._decoder) {
      this._decoder = this.owner && findDecoder(this.owner)
    }

    return this._decoder
  }

  set decoder(override: TopicDecoder | undefined) {
    this._decoder = override

    this.onDecoderChange.dispatch(override)
  }

  private clearCache = () => {
    if (this._cachedChildTopicCount) {
      this._cachedChildTopicCount = undefined
      // when child changes, parents are affected as well
      this.owner?.sourceEdge?.source?.viewModel?.clearCache()
    }
  }

  public constructor(treeNode: q.TreeNode<TopicViewModel>) {
    this.owner = treeNode
    this.selected = false
    this.expanded = true
    treeNode.onMerge.subscribe(this.clearCache)
  }

  private _cachedChildTopicCount: number | undefined = undefined

  /**
   * This function only returns valid values if parents are expanded
   * @returns
   */
  public getIndex(): number {
    if (!this.owner) {
      throw new Error('integrity error')
    }

    const source = this.owner.sourceEdge?.source

    const parentIndex = source?.viewModel?.getIndex()
    // If we have a parent, we have its index + 1 (at least)
    const parentIndexWithDepth = parentIndex !== undefined ? parentIndex + 1 : 0
    let position = 0
    const edgeToMatch = this.owner.sourceEdge
    for (const edge of source?.edgeArray ?? []) {
      if (edge === edgeToMatch) {
        break
      }
      position += edge.target.viewModel?.visibleChildren() ?? 1
    }

    return parentIndexWithDepth + position
  }

  public visibleChildAt(
    index: number,
    depth: number = 0,
    parentOffset: number = 0
  ): [q.TreeNode<TopicViewModel>, number] | undefined {
    if (!this.owner) {
      throw new Error('integrity error')
    }
    const node = this.owner

    if (parentOffset === index) {
      return [node, depth]
    }

    let position = parentOffset + 1
    for (const edge of node.edgeArray) {
      let viewModel = edge.target.viewModel
      const nextPosition = position + (viewModel?.visibleChildren() ?? 0)
      if (nextPosition > index) {
        return viewModel?.visibleChildAt(index, depth + 1, position)
      }
      position = nextPosition
    }
  }

  public visibleChildren(): number {
    if (!this.owner) {
      throw new Error('integrity error')
    }

    if (this._cachedChildTopicCount === undefined) {
      if (!this.expanded) {
        return 1
      }

      this._cachedChildTopicCount =
        1 + this.owner.edgeArray.map(e => e.target.viewModel?.visibleChildren() ?? 1).reduce((a, b) => a + b, 0)
    }

    return this._cachedChildTopicCount as number
  }

  public retain() {
    this.referenceCounter += 1
  }

  public release() {
    this.referenceCounter -= 1
    if (this.referenceCounter <= 0) {
      this.destroy()
    }
  }

  public destroy() {
    // console.log('destroy', this.owner?.path(), this.referenceCounter)
    this.owner?.onMerge.unsubscribe(this.clearCache)
    if (this.owner) {
      this.owner.viewModel = undefined
      this.owner = undefined
    }
    this.selectionChange.removeAllListeners()
    this.onDecoderChange.removeAllListeners()
    this.expandedChange.removeAllListeners()
  }

  public isSelected() {
    return this.selected
  }

  public isExpanded() {
    return this.expanded
  }

  public setSelected(selected: boolean) {
    this.selected = selected
    this.selectionChange.dispatch()
  }

  public setExpanded(expanded: boolean, fireEvent: boolean) {
    const didChange = this.expanded !== expanded
    this.expanded = expanded
    this.clearCache()

    if (didChange && fireEvent) {
      this.expandedChange.dispatch()
    }
  }
}
