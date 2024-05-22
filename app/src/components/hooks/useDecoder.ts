import * as q from '../../../../backend/src/Model'
import { useCallback, useState } from 'react'
import { TopicViewModel } from '../../model/TopicViewModel'
import { Base64Message } from '../../../../backend/src/Model/Base64Message'
import { useSubscription } from './useSubscription'
import { useViewModel } from '../Tree/TreeNode/effects/useViewModel'

export type DecoderFunction = (message: q.Message) => Base64Message | null

/**
 * Provides the latest decoder for a topic
 *
 * @param treeNode
 * @returns
 */
export function useDecoder(treeNode: q.TreeNode<TopicViewModel> | undefined): DecoderFunction {
  const viewModel = useViewModel(treeNode)
  const [decoder, setDecoder] = useState(viewModel?.decoder)

  useSubscription(viewModel?.onDecoderChange, setDecoder)

  return useCallback(
    message => {
      return decoder && message.payload ? decoder.decoder.decode(message.payload, decoder.format) : message.payload
    },
    [decoder]
  )
}
