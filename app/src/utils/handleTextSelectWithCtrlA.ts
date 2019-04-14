export const selectTextWithCtrlA = (options?: {targetSelector: string}) => (e: React.KeyboardEvent<HTMLDivElement>) => {
  const isCtrlA = (e.metaKey || e.ctrlKey) && e.key === 'a'

  if (isCtrlA && window.getSelection) {
    e.persist()
    e.preventDefault()
    e.stopPropagation()
    const selection = window.getSelection()
    const range = document.createRange()
    const eventTarget = (e.target as HTMLElement)
    const target: HTMLElement | null = (options) ? eventTarget.querySelector(options.targetSelector) : eventTarget

    if (!target) {
      console.error('Could not find matching target for Ctrl+A Event')
    }
    if (selection && target) {
      range.selectNodeContents(target)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}
