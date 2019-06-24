import { Destroyable } from '../../../backend/src/Model/Destroyable'
import { EventDispatcher } from '../../../events'

export class TopicViewModel implements Destroyable {
  private selected: boolean
  private expanded: boolean
  public selectionChange = new EventDispatcher<void, TopicViewModel>()
  public expandedChange = new EventDispatcher<void, TopicViewModel>()

  public constructor() {
    this.selected = false
    this.expanded = false
  }

  public destroy() {
    this.selectionChange.removeAllListeners()
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
    if (didChange && fireEvent) {
      this.expandedChange.dispatch()
    }
  }
}
