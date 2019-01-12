import { RingBuffer } from '../'
import { expect } from 'chai'
import 'mocha'

describe('RingBuffer', () => {
  it('should add a new value', () => {
    const b = new RingBuffer(30)
    b.add('hello')
    expect(b.toArray()[0]).to.eq('hello')
  })

  it('should add a new value after the first', () => {
    const b = new RingBuffer(30)
    b.add('hello')
    b.add('world')
    expect(b.toArray()[1]).to.eq('world')
  })

  it('should remove old values if buffer size is reached', () => {
    const b = new RingBuffer(6)
    b.add('hello')
    b.add('world')
    expect(b.toArray()[0]).to.eq('world')
  })

  it('items bigger then the buffer should be stored anyway', () => {
    const b = new RingBuffer(3)
    b.add('hello')
    expect(b.toArray()[0]).to.eq('hello')
    b.add('world')
    expect(b.toArray()[0]).to.eq('world')
  })

  it('max item count should be respected', () => {
    const b = new RingBuffer(100, 3)
    b.add('a')
    b.add('b')
    b.add('c')
    b.add('d')
    b.add('e')
    expect(b.toArray().length).to.eq(3)
    expect(b.toArray()[0]).to.eq('c')
    expect(b.toArray()[1]).to.eq('d')
    expect(b.toArray()[2]).to.eq('e')
  })
})
