import { AnyObject, Reference } from 'yup'
import { get } from '../utils'

type ResolveRefProps = {
  param: any
  values: any
  name: string
  context?: AnyObject
}

const refKeys = ['key', 'isContext', 'isValue', 'isSibling', 'path']

export const resolveRef = ({
  param,
  values,
  name,
  context,
}: ResolveRefProps) => {
  const isObject = param && typeof param === 'object'
  // check if object has all ref keys for class, or is a stump ref with type { type: 'ref', key: 'some.key' }
  const hasRefKeys = isObject
    ? refKeys.every((key) => Object.hasOwn(param, key))
    : false
  const isBasicRef =
    isObject &&
    (param.type === 'ref' ||
      (hasRefKeys && typeof (param as Reference).getValue !== 'function'))
  const isRefClass =
    hasRefKeys && typeof (param as Reference).getValue === 'function'

  if (isRefClass) {
    try {
      const reference = param as Reference
      let parent
      if (reference.isContext) {
        parent = values
      } else {
        const parentPath = name.split('.').slice(0, -1).join('.')
        parent = parentPath ? get(values, parentPath) : values
      }
      return reference.getValue(values, parent, context)
    } catch (err) {
      console.debug('Error parsing ref class, fallback on undefined', err)
      return undefined
    }
  } else if (isBasicRef) {
    try {
      const reference = param as Reference
      return get(values, reference.path || reference.key)
    } catch (err) {
      console.debug('Error parsing basic ref, fallback on undefined', err)
      return undefined
    }
  }
  return param
}

const getTypeCheck = (typeCheck?: string | ((value: unknown) => boolean)) => {
  if (!typeCheck) return () => true
  if (typeof typeCheck === 'string') {
    return (value: unknown) => typeof value === typeCheck
  }
  return typeCheck
}

export const resolveRefForExtractor = <T>({
  param,
  values,
  name,
  context,
  key,
  typeCheck,
  toStrictType,
}: ResolveRefProps & {
  key: string
  typeCheck?: string | ((value: unknown) => boolean)
  toStrictType?: (value: unknown) => T
}) => {
  const resolved = resolveRef({ param, values, name, context })
  if (resolved === undefined) return {}
  return getTypeCheck(typeCheck)(resolved)
    ? { [key]: (toStrictType ? toStrictType(resolved) : resolved) as T }
    : {}
}
