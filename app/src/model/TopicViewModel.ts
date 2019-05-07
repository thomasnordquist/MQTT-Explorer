import { Destroyable } from '../../../backend/src/Model/Destroyable'
import { EventDispatcher } from '../../../events'

export class TopicViewModel implements Destroyable {
  private selected: boolean
  public change = new EventDispatcher<void, TopicViewModel>()

  public constructor() {
    this.selected = false
  }

  public destroy() {
    this.change.removeAllListeners()
  }

  public isSelected() {
    return this.selected
  }

  public setSelected(selected: boolean) {
    this.selected = selected
    this.change.dispatch()
  }
}
