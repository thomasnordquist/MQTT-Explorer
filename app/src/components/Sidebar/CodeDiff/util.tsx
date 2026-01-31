export function trimNewlineRight(str: string) {
  if (str.slice(-1) === '\n') {
    return str.slice(0, -1)
  }

  return str
}

const gutterBaseStyle = {}

const additionStyle = {
  ...gutterBaseStyle,
  backgroundColor: 'rgba(10, 255, 10, 0.3)',
}

const deletionStyle = {
  ...gutterBaseStyle,
  backgroundColor: 'rgba(255, 10, 10, 0.3)',
}

export function lineChangeStyle(change: Diff.Change) {
  if (change.added === true) {
    return additionStyle
  }

  if (change.removed === true) {
    return deletionStyle
  }

  return gutterBaseStyle
}

export function toPlottableValue(value: any): number | undefined {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }

  const isNumber = !isNaN(value)
  const floatVal = parseFloat(value)
  if (isNumber && !isNaN(floatVal)) {
    return floatVal
  }

  const intVal = parseInt(value, undefined)
  if (isNumber && !isNaN(intVal)) {
    return intVal
  }

  // Convert "on" / "off" to int 1 / 0
  if (typeof value === 'string') {
    if (/^(on$)|(off$)/i.test(value)) {
      return value.toLowerCase() === 'on' ? 1 : 0
    }
    if (/^[0-9]*,[0-9]+$/.test(value)) {
      const parsedFloat = parseFloat(value.replace(',', '.'))
      if (!isNaN(parsedFloat)) {
        return parsedFloat
      }
    }
  }
}

export function isPlottable(value: any) {
  return !isNaN(toPlottableValue(value) as any)
}
