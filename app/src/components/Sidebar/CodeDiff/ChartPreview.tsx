import * as q from '../../../../../backend/src/Model'
import * as React from 'react'
import ShowChart from '@material-ui/icons/ShowChart'
import TopicPlot from '../../TopicPlot'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../../actions'
import { connect } from 'react-redux'
import { Fade, Paper, Popper, Tooltip } from '@material-ui/core'
import { JsonPropertyLocation } from '../../../../../backend/src/JsonAstParser'

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
      <ShowChart
        ref={chartIconRef}
        className={props.classes.icon}
        onMouseEnter={mouseOver}
        onMouseLeave={mouseOut}
        onClick={onClick}
        data-test-type="ShowChart"
        data-test={props.literal.path}
      />
    </Tooltip>
  ) : (
    <Tooltip title="Add to chart panel, not enough data for preview">
      <ShowChart
        onClick={onClick}
        className={props.classes.icon}
        style={{ color: '#aaa' }}
        data-test-type="ShowChart"
        data-test={props.literal.path}
      />
    </Tooltip>
  )

  return (
    <span>
      {addChartToPanelButton}
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
    </span>
  )
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      chart: bindActionCreators(chartActions, dispatch),
    },
  }
}

export default connect(undefined, mapDispatchToProps)(ChartPreview)
