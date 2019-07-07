import ClearAdornment from '../../helper/ClearAdornment'
import React, { useCallback } from 'react'
import { FormControl, Input, InputLabel } from '@material-ui/core'
import { publishActions } from '../../../actions'
import { bindActionCreators } from 'redux'
import { AppState } from '../../../reducers'
import { connect } from 'react-redux'

function TopicInput(props: { actions: typeof publishActions; topic?: string }) {
  console.log(props.topic)
  const updateTopic = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    props.actions.setTopic(e.target.value)
  }, [])

  const clearTopic = useCallback(() => {
    props.actions.setTopic('')
  }, [])

  const onTopicBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      props.actions.setTopic(undefined)
    }
  }, [])

  const topicStr = props.topic || ''
  return (
    <div>
      <FormControl style={{ width: '100%' }}>
        <InputLabel htmlFor="publish-topic">Topic</InputLabel>
        <Input
          id="publish-topic"
          value={topicStr}
          startAdornment={<span />}
          endAdornment={<ClearAdornment action={clearTopic} value={topicStr} />}
          onBlur={onTopicBlur}
          onChange={updateTopic}
          multiline={true}
          placeholder="example/topic"
        />
      </FormControl>
    </div>
  )
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(publishActions, dispatch),
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    topic: state.publish.topic,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopicInput)
