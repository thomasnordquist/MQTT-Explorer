import { EventDispatcher } from '../../events'

export class TopicViewModel {
  private selected: boolean
  public change = new EventDispatcher<void, TopicViewModel>(this)
  public attached = true // When the viewmodel is attached it's always visible

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
