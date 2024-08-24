import { resolveRef, resolveRefForExtractor } from './resolveRef'

describe('resolveRef', () => {
  it('should return the value for a basic reference object', () => {
    const param = { type: 'ref', key: 'some.key' }
    const values = { some: { key: 'value' } }
    const name = 'some.key'
    const result = resolveRef({ param, values, name })
    expect(result).toBe('value')
  })

  it('should return the value for a reference class object', () => {
    const param = {
      key: 'some.key',
      isContext: false,
      isValue: false,
      isSibling: false,
      path: 'some.key',
      getValue: jest.fn().mockReturnValue('value'),
    }
    const values = { some: { key: 'value' } }
    const name = 'some.key'
    const result = resolveRef({ param, values, name })
    expect(result).toBe('value')
  })

  it('should return the param if it is not a reference object', () => {
    const param = 'not a reference'
    const values = {}
    const name = 'some.key'
    const result = resolveRef({ param, values, name })
    expect(result).toBe(param)
  })

  it('should return undefined for an invalid reference object', () => {
    const param = { type: 'ref' }
    const values = {}
    const name = 'some.key'
    const result = resolveRef({ param, values, name })
    expect(result).toBeUndefined()
  })
})

describe('resolveRefForExtractor', () => {
  it('should return an object with the resolved value if type check passes', () => {
    const param = { type: 'ref', key: 'some.key' }
    const values = { some: { key: 'value' } }
    const name = 'some.key'
    const key = 'resolvedKey'
    const typeCheck = 'string'
    const result = resolveRefForExtractor({
      param,
      values,
      name,
      key,
      typeCheck,
    })
    expect(result).toEqual({ resolvedKey: 'value' })
  })

  it('should return an empty object if type check fails', () => {
    const param = { type: 'ref', key: 'some.key' }
    const values = { some: { key: 123 } }
    const name = 'some.key'
    const key = 'resolvedKey'
    const typeCheck = 'string'
    const result = resolveRefForExtractor({
      param,
      values,
      name,
      key,
      typeCheck,
    })
    expect(result).toEqual({})
  })

  it('should return an object with the strict type converted value if type check passes', () => {
    const param = { type: 'ref', key: 'some.key' }
    const values = { some: { key: '123' } }
    const name = 'some.key'
    const key = 'resolvedKey'
    const typeCheck = 'string'
    const toStrictType = (value: unknown) => parseInt(value as string, 10)
    const result = resolveRefForExtractor({
      param,
      values,
      name,
      key,
      typeCheck,
      toStrictType,
    })
    expect(result).toEqual({ resolvedKey: 123 })
  })

  it('should return an empty object if no type check is provided', () => {
    const param = { type: 'ref', key: 'some.key' }
    const values = { some: { key: 'value' } }
    const name = 'some.key'
    const key = 'resolvedKey'
    const result = resolveRefForExtractor({ param, values, name, key })
    expect(result).toEqual({ resolvedKey: 'value' })
  })
})
