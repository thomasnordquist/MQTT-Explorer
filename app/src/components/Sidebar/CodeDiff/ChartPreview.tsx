import * as React from 'react'
import ShowChart from '@mui/icons-material/ShowChart'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Fade, Paper, Popper, Tooltip } from '@mui/material'
import { JsonPropertyLocation } from '../../../../../backend/src/JsonAstParser'
import * as q from '../../../../../backend/src/Model'
import { chartActions } from '../../../actions'
import TopicPlot from '../../TopicPlot'

interface Props {
  treeNode: q.TreeNode<any>
  classes: any
  literal: JsonPropertyLocation
  actions: {
    chart: typeof chartActions
  }
}

function ChartPreview(props: Props) {
  const chartIconRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  const onClick = React.useCallback(() => {
    props.actions.chart.addChart({
      topic: props.treeNode.path(),
      dotPath: props.literal.path !== '' ? props.literal.path : undefined,
    })
    setOpen(false)
  }, [props.literal.path, props.treeNode])

  const mouseOver = React.useCallback(() => {
    setOpen(true)
  }, [])

  const mouseOut = React.useCallback(() => {
    setOpen(false)
  }, [])

  const hasEnoughDataToDisplayDiagrams = props.treeNode.messageHistory.count() > 1

  const addChartToPanelButton = hasEnoughDataToDisplayDiagrams ? (
    <Tooltip title="Add to chart panel">
      <span
        ref={chartIconRef}
        onMouseEnter={mouseOver}
        onMouseLeave={mouseOut}
        onClick={onClick}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        <ShowChart className={props.classes.icon} />
      </span>
    </Tooltip>
  ) : (
    <Tooltip title="Add to chart panel, not enough data for preview">
      <span onClick={onClick} style={{ cursor: 'pointer', display: 'inline-flex' }}>
        <ShowChart className={props.classes.icon} style={{ color: '#aaa' }} />
      </span>
    </Tooltip>
  )

  return (
    <div style={{ display: 'inline' }}>
      <span data-test-type="ShowChart" data-test={props.literal.path} style={{ display: 'inline-block' }}>
        {addChartToPanelButton}
      </span>
      <Popper open={open} anchorEl={chartIconRef.current} placement="left-end">
        <Fade in={open} timeout={300}>
          <Paper style={{ width: '300px' }}>
            {open ? (
              <TopicPlot node={props.treeNode} history={props.treeNode.messageHistory} dotPath={props.literal.path} />
            ) : (
              <span />
            )}
          </Paper>
        </Fade>
      </Popper>
    </div>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(ChartPreview)
