import { EventDispatcher } from '../../../../events'
import { expect } from 'chai'
import 'mocha'

describe('EventDispatcher', async () => {
  it('should dispatch', async function() {
    const dispatcher = new EventDispatcher<string, string>()
    this.timeout(300)

    setTimeout(() => dispatcher.dispatch('hello'), 5)
    const response = await new Promise(resolve => {
      dispatcher.subscribe(msg => {
        resolve(msg)
      })
    })

    expect(response).to.eq('hello')
  })

  it('should unsubscribe', async function() {
    const dispatcher = new EventDispatcher<string, string>()
    this.timeout(300)
    let incrementee = 0
    const callback = (msg: any) => {
      incrementee += 1
    }

    dispatcher.subscribe(callback)
    dispatcher.subscribe(callback)
    dispatcher.unsubscribe(callback)

    // Should increment to 1
    dispatcher.dispatch('hello')
    dispatcher.unsubscribe(callback)

    // should not cause any increment
    dispatcher.dispatch('hello')

    expect(incrementee).to.eq(1)
  })
})
