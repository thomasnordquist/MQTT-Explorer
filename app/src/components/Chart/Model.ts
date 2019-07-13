export interface Point {
  x: number
  y: number
}

export interface Tooltip {
  value: Array<TooltipRows>
  point: Point
  element: Element | null
}

export interface TooltipRows {
  title: React.ReactElement
  value: React.ReactElement
}
