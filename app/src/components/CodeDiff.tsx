import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as React from 'react'
import { Theme, withStyles, Badge } from '@material-ui/core'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

interface Props {
  previous: string
  current: string
  language?: 'json'
  classes: any
}

class CodeDiff extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  public render() {
    const changes = diff.diffLines(this.props.previous, this.props.current)
    const styledLines = Prism.highlight(this.props.current, Prism.languages.json).split('\n')

    let lineNumber = 0
    const code = changes.map((change, key) => {
      const hasStyledCode = change.removed !== true
      const changedLines = change.count || 0
      if (hasStyledCode && this.props.language === 'json') {
        const currentLines = styledLines.slice(lineNumber, lineNumber + changedLines)
        const lines = currentLines.map((l, idx) => {
          return <div key={`${key}-${idx}`} className={this.props.classes.line}><span className={this.cssClassForChange(change)} dangerouslySetInnerHTML={{ __html: l }} /></div>
        })
        lineNumber += changedLines

        return <div key={key}>{lines}</div>
      }

      return change.value
        .slice(0, -1) // Remove trailing newline
        .split('\n')
        .map((line, idx) => {
          return <div key={`${key}-${idx}`} className={this.props.classes.line}><span className={this.cssClassForChange(change)}>{line}</span></div>
        })
    })

    return (
      <pre className={`language-json ${this.props.classes.codeBlock}`}>
        {code}
      </pre>
    )
  }

  private cssClassForChange(change: diff.Change) {
    if (change.added === true) {
      return this.props.classes.addition
    }

    if (change.removed === true) {
      return this.props.classes.deletion
    }

    return this.props.classes.noChange
  }
}

const style = (theme: Theme) => {
  const baseStyle = {
    width: '100%',
  }
  const before = {
    margin: '0 2px 0 -9px',
    // width: '8px',
  }
  return {
    line: {
      lineHeight: 'normal',
    },
    codeBlock: {
      fontSize: '12px',
      maxHeight: '200px',
      marginLeft: '-16px',
    },
    noChange: {
      ...baseStyle,
      '&:before': {
        ...before,
      },
    },
    deletion: {
      ...baseStyle,
      backgroundColor: 'rgba(255, 10, 10, 0.3)',
      '&:before': {
        ...before,
        content: "'-'",
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 10, 10, 0.6)',
      },
    },
    addition: {
      ...baseStyle,
      backgroundColor: 'rgba(10, 255, 10, 0.3)',
      '&:hover': {
        backgroundColor: 'rgba(10, 255, 10, 0.5)',
      },
      '&:before': {
        ...before,
        content: "'+'",
      },
    },
  }
}

export default withStyles(style)(CodeDiff)
