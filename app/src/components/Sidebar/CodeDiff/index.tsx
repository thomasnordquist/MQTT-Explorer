import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import DiffCount from './DiffCount'
import Gutters from './Gutters'
import TopicPlot from '../TopicPlot'
import {
  Fade,
  Paper,
  Popper,
  withStyles
  } from '@material-ui/core'
import { isPlottable, lineChangeStyle, trimNewlineRight } from './util'
import { JsonPropertyLocation, literalsMappedByLines } from '../../../../../backend/src/JsonAstParser'
import { selectTextWithCtrlA } from '../../../utils/handleTextSelectWithCtrlA'
import { style } from './style'
import 'prismjs/components/prism-json'
const throttle = require('lodash.throttle')

interface Props {
  messageHistory: q.MessageHistory
  previous: string
  current: string
  nameOfCompareMessage: string
  language?: 'json'
  classes: any
}

interface State {
  diagram?: DiagramOptions
}

interface DiagramOptions {
  dotPath: string
  anchorEl: React.Ref<HTMLElement>
}

class CodeDiff extends React.Component<Props, State> {
  private handleCtrlA = selectTextWithCtrlA({ targetSelector: 'pre ~ pre' })

  private updateDiagram = throttle((diagram?: DiagramOptions) => {
    this.setState({ diagram })
  }, 200)

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  private showDiagram = (dotPath: string, target: React.Ref<Element>) => {
    this.updateDiagram({
      dotPath,
      anchorEl: target,
    })
  }

  private hideDiagram = () => {
    this.updateDiagram(undefined)
  }

  private plottableLiteralsIndexedWithLineNumbers() {
    const allLiterals = this.isValidJson(this.props.current) ? (literalsMappedByLines(this.props.current) || []) : []

    return allLiterals
      .map((l: JsonPropertyLocation) => isPlottable(l.value) ? l : undefined) as Array<JsonPropertyLocation>
  }

  private renderStyledCodeLines(changes: Array<Diff.Change>) {
    const styledLines = Prism.highlight(this.props.current, Prism.languages.json, 'json').split('\n')
    let lineNumber = 0

    return changes.map((change, key) => {
      const hasStyledCode = change.removed !== true
      const changedLines = change.count || 0
      if (hasStyledCode && this.props.language === 'json') {
        const currentLines = styledLines.slice(lineNumber, lineNumber + changedLines)
        const lines = currentLines.map((html: string, idx: number) => {
          return <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={this.props.classes.line}><span dangerouslySetInnerHTML={{ __html: html }} /></div>
        })
        lineNumber += changedLines

        return [<div key={key}>{lines}</div>]
      }

      return trimNewlineRight(change.value)
        .split('\n')
        .map((line, idx) => {
          return <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={this.props.classes.line}><span>{line}</span></div>
        })
    }).reduce((a, b) => a.concat(b), [])
  }

  public render() {
    const changes = diff.diffLines(this.props.previous, this.props.current)
    const literalPositions = this.plottableLiteralsIndexedWithLineNumbers()

    const code = this.renderStyledCodeLines(changes)

    const { diagram } = this.state
    const hasEnoughDataToDisplayDiagrams = this.props.messageHistory.count() > 1
    return (
      <div>
        <div tabIndex={0} onKeyDown={this.handleCtrlA} className={this.props.classes.codeWrapper}>
          <Gutters
            showDiagram={this.showDiagram}
            hideDiagram={this.hideDiagram}
            className={this.props.classes.gutters}
            hasEnoughDataToDisplayDiagrams={hasEnoughDataToDisplayDiagrams}
            changes={changes}
            literalPositions={literalPositions} />
          <pre className={this.props.classes.codeBlock}>{code}</pre>
        </div>
        <Popper
          open={Boolean(this.state.diagram) && hasEnoughDataToDisplayDiagrams}
          anchorEl={diagram && (diagram.anchorEl as any).current}
          placement="left-end"
        >
        <Fade in={Boolean(this.state.diagram)} timeout={300}>
          <Paper style={{ width: '300px' }}>
            {diagram ? <TopicPlot history={this.props.messageHistory} dotPath={diagram.dotPath} /> : <span/>}
          </Paper>
        </Fade>
        </Popper>
        <DiffCount changes={changes} nameOfCompareMessage={this.props.nameOfCompareMessage} />
      </div>
    )
  }

  private isValidJson(str: string) {
    try {
      JSON.parse(str)
      return true
    } catch (error) {
      return false
    }
  }
}

export default withStyles(style)(CodeDiff)
