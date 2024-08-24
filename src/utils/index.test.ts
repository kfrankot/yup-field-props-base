import { get, throwOrReturn, validNumberParam } from './index'

describe('throwOrReturn', () => {
  it('should throw an error when throwError is true', () => {
    expect(() =>
      throwOrReturn(new Error('Test error'), true, 'default'),
    ).toThrow('Test error')
  })

  it('should return the default value and log a warning when throwError is false', () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {})
    const result = throwOrReturn(new Error('Test error'), false, 'default')
    expect(result).toBe('default')
    expect(consoleWarnSpy).toHaveBeenCalledWith(new Error('Test error'))
    consoleWarnSpy.mockRestore()
  })
})

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

describe('validNumberParam', () => {
  it('should return true for a valid number', () => {
    expect(validNumberParam(42)).toBe(true)
  })

  it('should return true for a valid number string', () => {
    expect(validNumberParam('42')).toBe(true)
  })

  it('should return false for an invalid number string', () => {
    expect(validNumberParam('abc')).toBe(false)
  })

  it('should return false for a non-number value', () => {
    expect(validNumberParam({})).toBe(false)
  })
})
