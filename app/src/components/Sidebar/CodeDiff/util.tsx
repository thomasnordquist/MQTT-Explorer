export function trimNewlineRight(str: string) {
  if (str.slice(-1) === '\n') {
    return str.slice(0, -1)
  }

  return str
}

const gutterBaseStyle = {
  width: '100%',
}

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