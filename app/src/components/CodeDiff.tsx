import * as diff from 'diff'
import * as React from 'react'
import * as Prism from 'prismjs'
import { Theme, withStyles } from '@material-ui/core'
require('prismjs/components/prism-json')
import 'prismjs/themes/prism-tomorrow.css'

interface Props {
  previous: string
  current: string
  classes: any
}

interface State {
}

class CodeDiff extends React.Component<Props, State> {
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
      if (hasStyledCode) {
        const html = styledLines.slice(lineNumber, lineNumber + changedLines).join('\n')
        lineNumber += changedLines

        return <div key={key}><span className={this.cssClassForChange(change)} dangerouslySetInnerHTML={{ __html: html }} /></div>
      }

      return <div key={key}><span className={this.cssClassForChange(change)}>{change.value}</span></div>
    })

    return <pre style={{ maxHeight: '200px' }} className="language-json">{code}</pre>
  }

  private cssClassForChange(change: diff.Change) {
    if (change.added === true) {
      return this.props.classes.addition
    }

    if (change.removed === true) {
      return this.props.classes.deletion
    }

    return this.props.classes.code
  }
}

const style = (theme: Theme) => {
  const baseStyle = {
    width: '100%',
  }
  return {
    code: {
      ...baseStyle,
      // backgroundColor: theme.palette.background.paper,
      // color: theme.palette.text.primary,
    },
    deletion: {
      ...baseStyle,
      backgroundColor: 'rgba(255, 10, 10, 0.3)',
    },
    addition: {
      ...baseStyle,
      backgroundColor: 'rgba(10, 255, 10, 0.3)',
    },
  }
}

export default withStyles(style)(CodeDiff)
