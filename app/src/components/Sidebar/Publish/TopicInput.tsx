import React, { useCallback, useMemo, useRef } from 'react'
import { FormControl, Input, InputLabel } from '@mui/material'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { publishActions } from '../../../actions'
import { AppState } from '../../../reducers'
import ClearAdornment from '../../helper/ClearAdornment'

function TopicInput(props: { actions: typeof publishActions; manualTopic?: string; selectedTopic?: string }) {
  const inputElement = useRef<HTMLInputElement>(null)

  const updateTopic = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    props.actions.setTopic(e.target.value)
  }, [])

  const clearTopic = useCallback(() => {
    props.actions.setTopic('')
    inputElement.current?.focus()
  }, [])

  const onTopicBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      props.actions.setTopic(undefined)
    }
  }, [])

  const topicStr = props.manualTopic || ''

  return useMemo(
    () => (
      <div>
        <FormControl style={{ width: '100%' }}>
          <InputLabel htmlFor="publish-topic">Topic</InputLabel>
          <Input
            inputRef={inputElement}
            id="publish-topic"
            value={topicStr}
            startAdornment={<span />}
            endAdornment={<ClearAdornment action={clearTopic} value={topicStr} />}
            onBlur={onTopicBlur}
            onChange={updateTopic}
            multiline={false}
            placeholder={props.selectedTopic ?? 'example/topic'}
          />
        </FormControl>
      </div>
    ),
    [topicStr]
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(publishActions, dispatch),
})

const mapStateToProps = (state: AppState) => ({
  manualTopic: state.publish.manualTopic,
  selectedTopic: state.tree.get('selectedTopic')?.path(),
})

export default connect(mapStateToProps, mapDispatchToProps)(TopicInput)
