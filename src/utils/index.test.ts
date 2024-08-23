import { get } from './index'

describe('get function', () => {
  const obj = {
    a: {
      b: {
        c: 42,
      },
    },
    x: {
      y: null,
    },
  }

  it('should return the value of a nested property', () => {
    expect(get(obj, 'a.b.c')).toBe(42)
  })

  it('should return undefined for a non-existent property', () => {
    expect(get(obj, 'a.b.d' as any)).toBeUndefined()
  })

  it('should return undefined for a property with undefined value', () => {
    expect(get(obj, 'x.y.z' as any)).toBeUndefined()
  })

  it('should return undefined for an invalid path', () => {
    expect(get(obj, 'a..b' as any)).toBeUndefined()
  })

  it('should return undefined for an empty path', () => {
    expect(get(obj, '' as any)).toBeUndefined()
  })
})
