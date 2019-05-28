import 'mocha'

import { expect } from 'chai'
import { parseJson } from '../JsonAstParser'
const dotProp = require('dot-prop')

describe('access JSON values via dot property paths', () => {
  it('object with literal', () => {
    let data = {
      foo: 4,
    }

    let result = parseJson(JSON.stringify(data, undefined, 2))
    expect(result[0].path).to.eq('foo')
    expect(result[0].line).to.eq(2)
  })

  it('nested object', () => {
    let data = {
      foo: {
        bar: 4
      },
    }

    let result = parseJson(JSON.stringify(data, undefined, 2))
    expect(result[0].path).to.eq('foo.bar')
    expect(result[0].line).to.eq(3)
    expect(dotProp.get(data, result[0].path)).to.eq(4)

  })

  it('array path', () => {
    let data = {
      foo: [
        1,
        2,
        3,
      ],
    }

    let result = parseJson(JSON.stringify(data, undefined, 2))
    expect(result.length).to.eq(3)

    expect(result[2].path).to.eq('foo.2')
    expect(result[2].line).to.eq(5)
    expect(dotProp.get(data, result[2].path)).to.eq(3)
  })
})
