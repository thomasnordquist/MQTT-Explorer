import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as React from 'react'
import DiffCount from './DiffCount'
import { CodeBlockColors, CodeBlockColorsBraceMonokai } from '../CodeBlockColors'
import { literalsMappedByLines, parseJson } from '../../../../../backend/src/JsonAstParser'
import { selectTextWithCtrlA } from '../../../utils/handleTextSelectWithCtrlA'
import { Theme, withStyles } from '@material-ui/core'
import 'prismjs/components/prism-json'
import { trimNewlineRight, lineChangeStyle } from './util';
import Gutters from './Gutters'

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

  public render() {
    const changes = diff.diffLines(this.props.previous, this.props.current)
    const styledLines = Prism.highlight(this.props.current, Prism.languages.json, 'json').split('\n')
    const literalPositions = literalsMappedByLines(this.props.current)

    let lineNumber = 0
    const code = changes.map((change, key) => {
      const hasStyledCode = change.removed !== true
      const changedLines = change.count || 0
      if (hasStyledCode && this.props.language === 'json') {
        const currentLines = styledLines.slice(lineNumber, lineNumber + changedLines)
        const lines = currentLines.map((html: string, idx: number) => {
          return <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={`${this.props.classes.line}`}><span dangerouslySetInnerHTML={{ __html: html }} /></div>
        })
        lineNumber += changedLines

        return <div key={key}>{lines}</div>
      }

      return trimNewlineRight(change.value)
        .split('\n')
        .map((line, idx) => {
          return <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={this.props.classes.line}><span>{line}</span></div>
        })
    })

    return (
      <div>
        <div tabIndex={0} onKeyDown={this.handleCtrlA} className={this.props.classes.codeWrapper}>
          <pre className={this.props.classes.gutters}><Gutters changes={changes} literalPositions={literalPositions} /></pre>
          <pre className={this.props.classes.codeBlock}>{code}</pre>
        </div>
        <DiffCount changes={changes} nameOfCompareMessage={this.props.nameOfCompareMessage} />
      </div>
    )
  }
}

const style = (theme: Theme) => {
  const codeBlockColors = theme.palette.type === 'light' ? CodeBlockColors : CodeBlockColorsBraceMonokai

  const codeBaseStyle = {
    font: "12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
    display: 'inline-grid' as 'inline-grid',
    margin: '0',
    padding: '1px 0 2px 0',
  }

  return {
    line: {
      lineHeight: 'normal' as 'normal',
      paddingLeft: '4px',
      width: '100%',
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
  }
}

export default withStyles(style)(CodeDiff)
