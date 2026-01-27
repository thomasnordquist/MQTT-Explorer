import { useCallback, useState } from 'react'
import { Decoder } from '../../../../backend/src/Model/Decoder'
import * as q from '../../../../backend/src/Model'
import { TopicViewModel } from '../../model/TopicViewModel'
import { useSubscription } from './useSubscription'
import { useViewModel } from '../Tree/TreeNode/effects/useViewModel'
import { DecoderEnvelope } from '../../decoders/DecoderEnvelope'

export type DecoderFunction = (message: q.Message) => DecoderEnvelope | undefined

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
    message =>
      decoder && message.payload
        ? decoder.decoder.decode(message.payload, decoder.format)
        : { message: message.payload ?? undefined, decoder: Decoder.NONE },
    [decoder]
  )
}
