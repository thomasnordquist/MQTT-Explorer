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

  // The decoder is READ on every render rather than seeded into state. `viewModel.decoder` is a
  // lazy getter that detects a decoder from the topic on first access and caches it, and a
  // `useState` initial value is only honoured on the first render — so seeding from it captured
  // whatever was there at mount (undefined, before the view model existed) and never looked again.
  // The subscription now exists only to re-render when a format is chosen by hand.
  const [, setOverrideGeneration] = useState(0)
  const rerenderOnOverride = useCallback(() => setOverrideGeneration(n => n + 1), [])
  useSubscription(viewModel?.onDecoderChange, rerenderOnOverride)

  const decoder = viewModel?.decoder

  return useCallback(
    message =>
      decoder && message.payload
        ? decoder.decoder.decode(message.payload, decoder.format)
        : { message: message.payload ?? undefined, decoder: Decoder.NONE },
    [decoder]
  )
}
