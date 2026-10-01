export interface Point {
  x: number
  y: number
}

/**
 * Minimal virtual element accepted by MUI's Popper as an anchor.
 * Lets the tooltip follow an arbitrary screen position such as the pointer.
 */
export interface TooltipAnchor {
  getBoundingClientRect: () => DOMRect
}

export interface Tooltip {
  value: Array<TooltipRows>
  point: Point
  element: Element | TooltipAnchor | null
}

export interface TooltipRows {
  title: React.ReactElement
  value: React.ReactElement
}
