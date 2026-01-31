import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as React from 'react'
import { JsonPropertyLocation, literalsMappedByLines } from '../../../../../backend/src/JsonAstParser'
import { Typography } from '@mui/material'
import { withStyles } from '@mui/styles'
import * as q from '../../../../../backend/src/Model'
import DiffCount from './DiffCount'
import Gutters from './Gutters'
import { isPlottable, lineChangeStyle, trimNewlineRight } from './util'
import { selectTextWithCtrlA } from '../../../utils/handleTextSelectWithCtrlA'
import { style } from './style'
import 'prismjs/components/prism-json'

interface Props {
  treeNode: q.TreeNode<any>
  previous: string
  current: string
  nameOfCompareMessage: string
  language?: 'json'
  title?: string
  classes: any
}

interface State {}

class CodeDiff extends React.PureComponent<Props, State> {
  private handleCtrlA = selectTextWithCtrlA({ targetSelector: 'pre ~ pre' })

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  private isValidJson(str: string) {
    try {
      JSON.parse(str)
      return true
    } catch (error) {
      return false
    }
  }

  private plottableLiteralsIndexedWithLineNumbers() {
    const allLiterals = this.isValidJson(this.props.current) ? literalsMappedByLines(this.props.current) || [] : []

    return allLiterals.map((l: JsonPropertyLocation) =>
      isPlottable(l.value) ? l : undefined
    ) as Array<JsonPropertyLocation>
  }

  private renderStyledCodeLines(changes: Array<Diff.Change>) {
    const styledLines = Prism.highlight(this.props.current, Prism.languages.json, 'json').split('\n')
    let lineNumber = 0

    return changes
      .map((change, key) => {
        const hasStyledCode = change.removed !== true
        const changedLines = change.count || 0
        if (hasStyledCode && this.props.language === 'json') {
          const currentLines = styledLines.slice(lineNumber, lineNumber + changedLines)
          const lines = currentLines.map((html: string, idx: number) => (
            <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={this.props.classes.line}>
              <span dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ))
          lineNumber += changedLines

          return [<div key={key}>{lines}</div>]
        }

        return trimNewlineRight(change.value)
          .split('\n')
          .map((line, idx) => (
            <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={this.props.classes.line}>
              <span>{line}</span>
            </div>
          ))
      })
      .reduce((a, b) => a.concat(b), [])
  }

  public render() {
    const changes = diff.diffLines(this.props.previous, this.props.current)
    const literalPositions = this.plottableLiteralsIndexedWithLineNumbers()
    const code = this.renderStyledCodeLines(changes)

    return (
      <div style={{ marginTop: '8px' }}>
        {this.props.title ? <Typography className={this.props.classes.title}>{this.props.title}</Typography> : null}
        <div tabIndex={0} onKeyDown={this.handleCtrlA} className={this.props.classes.codeWrapper}>
          <Gutters
            className={this.props.classes.gutters}
            changes={changes}
            treeNode={this.props.treeNode}
            literalPositions={literalPositions}
          />
          <pre className={this.props.classes.codeBlock}>{code}</pre>
        </div>
        <DiffCount changes={changes} nameOfCompareMessage={this.props.nameOfCompareMessage} />
      </div>
    )
  }
}

export default withStyles(style)(CodeDiff)
