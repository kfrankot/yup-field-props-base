import {
  SchemaDescription,
  Reference,
  ObjectSchema,
  AnyObject,
  mixed,
} from 'yup'
import { AllFieldProps, FieldProps } from '../types'
import { getValidationExtractionFuncByType } from '../extractors'
import { get } from 'lodash'
import { getFieldDescription } from './getFieldDescription'
import { throwOrReturn } from '../utils'

const isValidTest = (test: SchemaDescription['tests'][0]) => {
  return !!test.name
}

const refKeys = ['key', 'isContext', 'isValue', 'isSibling', 'path']

const resolveRef = ({
  param,
  values,
  name,
  context,
}: {
  param: any
  values: any
  name: string
  context?: any
}) => {
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

const getDefaultFieldProps = (): FieldProps => {
  return {
    type: 'mixed',
    required: false,
    nullable: false,
    oneOf: [],
    notOneOf: [],
    description: mixed().describe(),
    tests: [],
  }
}

export const getFieldPropsFromDescription = <
  T extends FieldProps = AllFieldProps,
>({
  name,
  fieldDescription,
  values,
  context,
  throwError = false,
}: {
  name: string
  fieldDescription: SchemaDescription
  values: any
  context?: any
  throwError?: boolean
}) => {
  if (!fieldDescription && !throwError) {
    console.warn('No field description found for', name)
    // fallback on default props when not found, rather than an error,to match how form libraries like rhf and formik work
    // This should be ok as far as typing, as any of the props outside the core FieldProps are marked as optional
    // on the type specific validators
    return getDefaultFieldProps() as T
  }
  try {
    const type = fieldDescription.type
    const fieldProps: AllFieldProps = {
      type,
      required: !fieldDescription.optional,
      nullable: fieldDescription.nullable,
      oneOf: fieldDescription.oneOf.map((value) => {
        return resolveRef({ param: value, values, name, context })
      }),
      notOneOf: fieldDescription.notOneOf.map((value) => {
        return resolveRef({ param: value, values, name, context })
      }),
      default: resolveRef({
        param: fieldDescription.default,
        values,
        name,
        context,
      }),
      description: fieldDescription,
      tests: fieldDescription.tests,
    }
    if (fieldProps.default === undefined) {
      delete fieldProps.default
    }

    const validatorExtractionFunc = getValidationExtractionFuncByType(type)

    if (!validatorExtractionFunc) return fieldProps

    const customTests: SchemaDescription['tests'] = []
    fieldDescription.tests.forEach((test) => {
      if (!isValidTest(test)) return
      const newProps = validatorExtractionFunc(test)
      // iterate over all props and resolve refs
      Object.keys(newProps).forEach((key) => {
        ;(newProps as any)[key] = resolveRef({
          param: (newProps as any)[key],
          values,
          name,
          context,
        })
      })
      Object.assign(fieldProps, newProps)
      if (Object.keys(newProps).length === 0) {
        customTests.push(test)
      }
    })

    // Assign custom tests as long as they don't collide with other props,
    // and default params to true to match behavior of known validators
    customTests.forEach((test) => {
      if (Object.hasOwn(fieldProps, test.name || '')) {
        return
      }
      let params: any =
        test.params && typeof test.params === 'object'
          ? { ...test.params }
          : test.params
      if (params && typeof params === 'object') {
        Object.keys(params).forEach((key) => {
          params[key] = resolveRef({
            param: params[key],
            values,
            name,
            context,
          })
        })
      } else {
        params = resolveRef({ param: params, values, name, context })
      }
      Object.assign(fieldProps, { [test.name || '']: params ?? true })
    })

    if (type === 'array') {
      const of = (fieldDescription as any).innerType as SchemaDescription
      if (of) {
        fieldProps.of = getFieldPropsFromDescription({
          name: name + '[]',
          fieldDescription: of,
          values,
          context,
        })
      }
    }

    return fieldProps as T
  } catch (error) {
    return throwOrReturn(error, throwError, getDefaultFieldProps() as T)
  }
}

export const getFieldProps = <T extends FieldProps = AllFieldProps>({
  name,
  schema,
  values,
  context,
  throwError = false,
}: {
  name: string
  schema: ObjectSchema<any, AnyObject, any, ''>
  values: any
  context?: any
  throwError?: boolean
}) => {
  const fieldDescription = getFieldDescription({
    name,
    schema,
    values,
    context,
    throwError,
  })
  return getFieldPropsFromDescription<T>({
    name,
    fieldDescription: fieldDescription as SchemaDescription,
    values,
    context,
    throwError,
  })
}
