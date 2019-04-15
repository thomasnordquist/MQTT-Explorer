import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as React from 'react'
import { CodeBlockColors, CodeBlockColorsBraceMonokai } from './CodeBlockColors'
import { selectTextWithCtrlA } from '../../utils/handleTextSelectWithCtrlA'
import { Theme, withStyles } from '@material-ui/core'
import 'prismjs/components/prism-json'

interface Props {
  previous: string
  current: string
  nameOfCompareMessage: string
  language?: 'json'
  classes: any
}

class CodeDiff extends React.Component<Props, {}> {
  private handleCtrlA = selectTextWithCtrlA({ targetSelector: 'pre ~ pre' })

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
          return <div key={`${key}-${idx}`} className={`${this.props.classes.line} ${this.cssClassForChange(change)}`}><span dangerouslySetInnerHTML={{ __html: html }} /></div>
        })
        lineNumber += changedLines

        return <div key={key}>{lines}</div>
      }

      return this.trimNewlineRight(change.value)
        .split('\n')
        .map((line, idx) => {
          return <div key={`${key}-${idx}`} className={`${this.props.classes.line} ${this.cssClassForChange(change)}`}><span>{line}</span></div>
        })
    })

    const gutters = changes.map((change, key) => {
      return this.trimNewlineRight(change.value)
        .split('\n')
        .map((_, idx) => (
          <div key={`${key}-${idx}`} className={`${this.cssClassForChange(change)} ${this.props.classes.gutterLine}`}>
            {change.added ? '+' : null}{change.removed ? '-' : null}{!change.added && !change.removed ? ' ' : null}
          </div>
        ))
    })

    return (
      <div>
        <div tabIndex={0} onKeyDown={this.handleCtrlA} className={this.props.classes.codeWrapper}>
          <pre className={this.props.classes.gutters}>{gutters}</pre>
          <pre className={this.props.classes.codeBlock}>{code}</pre>
        </div>
        {this.renderChangeAmount(changes)}
      </div>
    )
  }
}

const style = (theme: Theme) => {
  const codeBlockColors = theme.palette.type === 'light' ? CodeBlockColors : CodeBlockColorsBraceMonokai
  const gutterBaseStyle = {
    width: '100%',
  }

  const codeBaseStyle = {
    font: "12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
    display: 'inline-grid' as 'inline-grid',
    margin: '0',
    padding: '1px 0 2px 0',
  }

  return {
    additions: {
      color: 'rgb(10, 255, 10)',
    },
    deletions: {
      color: 'rgb(255, 10, 10)',
    },
    line: {
      lineHeight: 'normal' as 'normal',
      paddingLeft: '4px',
    },
    gutterLine: {
      textAlign: 'right' as 'right',
      paddingRight: theme.spacing(0.5),
    },
    codeWrapper: {
      maxHeight: '15em',
      overflow: 'auto',
      backgroundColor: `${codeBlockColors.background}`,
      margin: '8px 0 0 0',
    },
    gutters: {
      ...codeBaseStyle,
      width: '33px',
      backgroundColor: codeBlockColors.gutters,
      userSelect: 'none' as 'none',
    },
    codeBlock: {
      ...codeBaseStyle,
      width: 'calc(100% - 33px)',
      backgroundColor: 'inherit !important',
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
      ...gutterBaseStyle,
    },
    deletion: {
      ...gutterBaseStyle,
      backgroundColor: 'rgba(255, 10, 10, 0.3)',
      '&:hover': {
        backgroundColor: 'rgba(255, 10, 10, 0.6)',
      },
    },
    addition: {
      ...gutterBaseStyle,
      backgroundColor: 'rgba(10, 255, 10, 0.3)',
      '&:hover': {
        backgroundColor: 'rgba(10, 255, 10, 0.5)',
      },
    },
  }
}

export default withStyles(style)(CodeDiff)
