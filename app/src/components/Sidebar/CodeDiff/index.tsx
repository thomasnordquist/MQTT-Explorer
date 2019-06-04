import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import DiffCount from './DiffCount'
import Gutters from './Gutters'
import TopicPlot from '../TopicPlot'
import { CodeBlockColors, CodeBlockColorsBraceMonokai } from '../CodeBlockColors'
import { isPlottable, lineChangeStyle, trimNewlineRight } from './util'
import { JsonPropertyLocation, literalsMappedByLines } from '../../../../../backend/src/JsonAstParser'
import { Theme, withStyles, Popper, Paper, Fade, Zoom } from '@material-ui/core'
import { selectTextWithCtrlA } from '../../../utils/handleTextSelectWithCtrlA'
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
  dotPath?: string
  anchorEl?: EventTarget
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

  private showDiagram(dotPath: string, target: EventTarget) {
    this.updateDiagram({
      dotPath,
      anchorEl: target,
    })
  }

  private hideDiagram() {
    this.updateDiagram(undefined)
  }

  public render() {
    const changes = diff.diffLines(this.props.previous, this.props.current)
    const styledLines = Prism.highlight(this.props.current, Prism.languages.json, 'json').split('\n')
    const literalPositions = (
      (literalsMappedByLines(this.props.current) || [])
          .map((l: JsonPropertyLocation) => isPlottable(l.value) ? l : undefined)
    ) as Array<JsonPropertyLocation>

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

        return [<div key={key}>{lines}</div>]
      }

      return trimNewlineRight(change.value)
        .split('\n')
        .map((line, idx) => {
          return <div key={`${key}-${idx}`} style={lineChangeStyle(change)} className={this.props.classes.line}><span>{line}</span></div>
        })
    }).reduce((a, b) => a.concat(b), [])

    const { diagram } = this.state

    return (
      <div>
        <div tabIndex={0} onKeyDown={this.handleCtrlA} className={this.props.classes.codeWrapper}>
          <Gutters
            showDiagram={(dotPath, target) => this.showDiagram(dotPath, target)}
            hideDiagram={() => this.hideDiagram()}
            className={this.props.classes.gutters}
            changes={changes}
            literalPositions={literalPositions} />
          <pre className={this.props.classes.codeBlock}>{code}</pre>
        </div>
        <Popper
          open={Boolean(this.state.diagram)}
          anchorEl={diagram && diagram.anchorEl as any}
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
}

const style = (theme: Theme) => {
  const codeBlockColors = theme.palette.type === 'light' ? CodeBlockColors : CodeBlockColorsBraceMonokai

  const codeBaseStyle = {
    font: "12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
    display: 'inline-grid' as 'inline-grid',
    margin: '0',
    padding: '1px 0 0 0',
  }

  return {
    line: {
      lineHeight: 'normal' as 'normal',
      paddingLeft: '4px',
      width: '100%',
      height: '16px',
    },
    codeWrapper: {
      display: 'flex',
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
