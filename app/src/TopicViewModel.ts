import { EventDispatcher } from '../../events'

export class TopicViewModel {
  private selected: boolean
  public change = new EventDispatcher<void, TopicViewModel>(this)

  public constructor() {
    this.selected = false
  }

  public isSelected() {
    return this.selected
  }

  public setSelected(selected: boolean) {
    this.selected = selected
    this.change.dispatch()
  }
}
