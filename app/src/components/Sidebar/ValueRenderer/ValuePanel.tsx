import React, { useCallback } from 'react'
import { bindActionCreators } from 'redux'
import { Typography } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { connect } from 'react-redux'
import * as q from '../../../../../backend/src/Model'
import ActionButtons from './ActionButtons'
import Copy from '../../helper/Copy'
import Save from '../../helper/Save'
import DateFormatter from '../../helper/DateFormatter'
import MessageHistory from './MessageHistory'
import Panel from '../Panel'
import ValueRenderer from './ValueRenderer'
import { AppState } from '../../../reducers'
import { sidebarActions } from '../../../actions'
import DeleteSelectedTopicButton from './DeleteSelectedTopicButton'
import { MessageId } from '../MessageId'
import { useDecoder } from '../../hooks/useDecoder'

interface Props {
  node?: q.TreeNode<any>
  sidebarActions: typeof sidebarActions
  classes: any
  lastUpdate: number
  compareMessage?: q.Message
}

function RenderedValue(props: { node?: q.TreeNode<any>; compareMessage?: q.Message }) {
  const { node, compareMessage } = props

  if (!node || !node.message) {
    return null
  }

  return <ValueRenderer treeNode={node} message={node.message} compareWith={compareMessage} />
}

function ValuePanel(props: Props) {
  const { node, compareMessage } = props
  const decodeMessage = useDecoder(node)

  function renderViewOptions() {
    if (!props.node || !props.node.message) {
      return null
    }

    return (
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
        <span style={{ marginTop: '2px', flexGrow: 1 }}>
          <ActionButtons />
        </span>
        <span style={{ flex: 6, textAlign: 'right' }}>
          {props.node.message.retain ? <DeleteSelectedTopicButton /> : null}
        </span>
        {messageMetaInfo()}
      </div>
    )
  }

  const getDecodedValue = useCallback(
    () => node?.message && decodeMessage(node.message)?.message?.toUnicodeString(),
    [node, decodeMessage]
  )

  const getData = () => {
    if (node?.message && node.message.payload) {
      return node.message.payload.base64Message
    }
  }

  function messageMetaInfo() {
    if (!props.node || !props.node.message) {
      return null
    }

    return (
      <span style={{ width: '100%', paddingLeft: '8px', flex: 6 }}>
        <Typography style={{ textAlign: 'right' }}>
          <MessageId message={props.node.message} addComma />
          {`QoS: ${props.node.message.qos}`}
        </Typography>
        <Typography style={{ textAlign: 'right' }}>
          <i>
            <DateFormatter date={props.node.message.received} />
          </i>
        </Typography>
      </span>
    )
  }

  const handleMessageHistorySelect = useCallback(
    (message: q.Message) => {
      if (message !== compareMessage) {
        props.sidebarActions.setCompareMessage(message)
      } else {
        props.sidebarActions.setCompareMessage(undefined)
      }
    },
    [compareMessage]
  )

  const [value] =
    node && node.message && node.message.payload ? node.message.payload?.format(node.type) : [null, undefined]
  const copyValue = value ? <Copy getValue={getDecodedValue} /> : null
  const saveValue = value ? <Save getData={getData} /> : null

  return (
    <Panel>
      <span>
        Value {copyValue} {saveValue}
      </span>
      <span style={{ width: '100%' }}>
        {renderViewOptions()}
        <div style={{ marginBottom: '-8px', marginTop: '8px' }}>
          <React.Suspense fallback={<div>Loading...</div>}>
            <RenderedValue node={node} compareMessage={compareMessage} />
          </React.Suspense>
        </div>
        <div>
          <MessageHistory onSelect={handleMessageHistorySelect} selected={props.compareMessage} node={props.node} />
        </div>
      </span>
    </Panel>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  sidebarActions: bindActionCreators(sidebarActions, dispatch),
})

const mapStateToProps = (state: AppState) => ({
  node: state.tree.get('selectedTopic'),
  compareMessage: state.sidebar.get('compareMessage'),
})

const styles = (theme: Theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
})

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ValuePanel) as any)
