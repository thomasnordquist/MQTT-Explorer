import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as React from 'react'
import { Theme, withStyles } from '@material-ui/core'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'
import { CodeBlockColors, CodeBlockColorsBraceMonokai } from './CodeBlockColors'

interface Props {
  previous: string
  current: string
  nameOfCompareMessage: string
  language?: 'json'
  classes: any
}

class CodeDiff extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  private renderChangeAmount(changes: Array<Diff.Change>) {
    const additions = changes.map(change => (change.added === true) ? (change.count || 0) : 0).reduce((a, b) => a + b)
    const deletions = changes.map(change => (change.removed === true) ? (change.count || 0) : 0).reduce((a, b) => a + b)
    if (additions === 0 && deletions === 0) {
      return null
    }

    return (
      <span style={{ display: 'block', marginBottom: '8px', float: 'right' }}>
        <span>
          Comparing with <b>{this.props.nameOfCompareMessage}</b> message:&nbsp;

          <span className={this.props.classes.additions}>+ {additions} line{additions === 1 ? '' : 's'}</span>
          , <span className={this.props.classes.deletions}>- {deletions} line{deletions === 1 ? '' : 's'}</span>
        </span>
      </span>
    )
  }

  private trimNewlineRight(str: string) {
    if (str.slice(-1) === '\n') {
      return str.slice(0, -1)
    }

    return str
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

  private selectText = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isCtrlA = (e.metaKey || e.ctrlKey) && e.key === 'a'

    if (isCtrlA && window.getSelection) {
      e.persist()
      e.preventDefault()
      e.stopPropagation()
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents((e.target as HTMLElement).getElementsByTagName('pre')[0])
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  public render() {
    const changes = diff.diffLines(this.props.previous, this.props.current)
    const styledLines = Prism.highlight(this.props.current, Prism.languages.json, 'json').split('\n')

    let lineNumber = 0
    const code = changes.map((change, key) => {
      const hasStyledCode = change.removed !== true
      const changedLines = change.count || 0
      if (hasStyledCode && this.props.language === 'json') {
        const currentLines = styledLines.slice(lineNumber, lineNumber + changedLines)
        const lines = currentLines.map((html: string, idx: number) => {
          return <div key={`${key}-${idx}`} className={this.props.classes.line}><span className={this.cssClassForChange(change)} dangerouslySetInnerHTML={{ __html: html }} /></div>
        })
        lineNumber += changedLines

        return <div key={key}>{lines}</div>
      }

      return this.trimNewlineRight(change.value)
        .split('\n')
        .map((line, idx) => {
          return <div key={`${key}-${idx}`} className={this.props.classes.line}><span className={this.cssClassForChange(change)}>{line}</span></div>
        })
    })

    return (
      <div>
        <div className={this.props.classes.gutters} tabIndex={0} onKeyDown={this.selectText}>
          <pre className={`language-json ${this.props.classes.codeBlock}`} >
            {code}
          </pre>
        </div>
        {this.renderChangeAmount(changes)}
      </div>
    )
  }
}

const style = (theme: Theme) => {
  const codeBlockColors = theme.palette.type === 'light' ? CodeBlockColors : CodeBlockColorsBraceMonokai
  const baseStyle = {
    width: '100%',
  }
  const before = {
    margin: '0 2px 0 -9px',
    color: codeBlockColors.text,
  }

  return {
    additions: {
      color: 'rgb(10, 255, 10)',
    },
    deletions: {
      color: 'rgb(255, 10, 10)',
    },
    line: {
      lineHeight: 'normal',
    },
    gutters: {
      backgroundColor: codeBlockColors.gutters,
    },
    codeBlock: {
      fontSize: '12px',
      maxHeight: '200px',
      marginLeft: '33px !important',
      backgroundColor: `${codeBlockColors.background} !important`,
      '& span': {
        color: codeBlockColors.text,
      },
      '& .token.number': {
        color: codeBlockColors.numeric,
      },
      '& .token.boolean': {
        color: codeBlockColors.numeric,
      },
      '& .token.property': {
        color: codeBlockColors.variable,
      },
      '& .token.string': {
        color: codeBlockColors.string,
      },
      '& .token': {
        color: codeBlockColors.text,
      },
      '& .token.operator': {
        color: codeBlockColors.text,
      },
      '& .token.punctuation': {
        color: codeBlockColors.text,
      },
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
