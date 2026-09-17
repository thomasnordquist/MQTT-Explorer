import React from 'react'
import { expect } from 'chai'
import { cleanup, renderWithProviders } from '../../utils/spec/testUtils'
import { ToggleSwitch } from './ToggleSwitch'

describe('ToggleSwitch', () => {
  afterEach(() => cleanup())

  it('exposes one switch for assistive technology', () => {
    const classes = { switch: '' }
    const toggle = () => {}
    const onSwitch = <ToggleSwitch classes={classes} label="Enabled" toggle={toggle} value />
    const { getAllByRole, getByRole, rerender } = renderWithProviders(onSwitch)

    const switches = getAllByRole('switch')
    expect(switches).to.have.length(1)
    expect(getByRole('switch', { name: /^Enabled/ })).to.have.property('checked', true)

    const offSwitch = <ToggleSwitch classes={classes} label="Enabled" toggle={toggle} value={false} />
    rerender(offSwitch)

    expect(getByRole('switch', { name: /^Enabled/ })).to.have.property('checked', false)
  })
})
