import {
  amber,
  orange,
  pink,
  purple,
  deepPurple,
  teal,
  red,
  green,
  lime,
  indigo,
  yellow,
  brown,
  blueGrey,
} from '@mui/material/colors'

export function colors() {
  function colorToInt(color: string): [number, number, number] {
    const str = color.replace('#', '')
    return [parseInt(str.slice(0, 2), 16), parseInt(str.slice(2, 4), 16), parseInt(str.slice(4, 6), 16)]
  }
  function colorCompare(colorA: string, colorB: string) {
    const a = colorToInt(colorA)
    const b = colorToInt(colorB)
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
  }
  const colors: Array<string> = [
    brown,
    blueGrey,
    amber,
    orange,
    pink,
    purple,
    deepPurple,
    teal,
    red,
    green,
    lime,
    indigo,
    yellow,
  ]
    .map(color => [color[200], color[500], color[700]])
    .reduce((a, b) => a.concat(b), [])
    .sort((a, b) => colorCompare(a, b))
  return colors
}
