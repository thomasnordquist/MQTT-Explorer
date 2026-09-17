import * as React from 'react'
import { cleanup, render } from '@testing-library/react'
import { expect } from 'chai'
import 'jsdom-global/register'
import 'mocha'
import { KeyCodes } from '../utils/KeyCodes'
import { useGlobalKeyEventHandler } from './useGlobalKeyEventHandler'

interface HarnessProps {
  enabled: boolean
  onEnter: (event: KeyboardEvent) => void
}

function KeyboardHandlerHarness({ enabled, onEnter }: HarnessProps) {
  useGlobalKeyEventHandler(KeyCodes.enter, onEnter, enabled)
  return null
}

describe('useGlobalKeyEventHandler', () => {
  afterEach(() => cleanup())

  it('leaves Enter available to a textarea after the shortcut is disabled', () => {
    let callCount = 0
    const onEnter = () => {
      callCount += 1
    }
    const { rerender } = render(<KeyboardHandlerHarness enabled onEnter={onEnter} />)
    const textarea = document.createElement('textarea')
    textarea.setAttribute('aria-label', 'Last Will payload')
    document.body.appendChild(textarea)
    const activeEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      keyCode: KeyCodes.enter,
    })
    textarea.dispatchEvent(activeEvent)

    expect(callCount).to.equal(1)
    expect(activeEvent.defaultPrevented).to.equal(true)

    rerender(<KeyboardHandlerHarness enabled={false} onEnter={onEnter} />)
    const inactiveEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      keyCode: KeyCodes.enter,
    })

    textarea.dispatchEvent(inactiveEvent)
    textarea.remove()

    expect(callCount).to.equal(1)
    expect(inactiveEvent.defaultPrevented).to.equal(false)
  })
})
