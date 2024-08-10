import { SchemaDescription, SchemaObjectDescription } from 'yup'
import { AllFieldProps, FieldProps } from '../types'
import {
  getFieldDescriptionFromName,
  getFieldDescriptionFromPath,
} from './getFieldDescription'
import { getValidationExtractionFuncByType } from '../extractors'

const isValidTest = (test: SchemaDescription['tests'][0]) => {
  return !!test.name
}

export const getPropsFromFieldDescription = <
  T extends FieldProps = AllFieldProps,
>(
  fieldDescription: SchemaDescription | null,
) => {
  if (!fieldDescription) return {} as T

  const type = fieldDescription.type
  const fieldProps: AllFieldProps = {
    type,
    required: !fieldDescription.optional,
    nullable: fieldDescription.nullable,
    oneOf: fieldDescription.oneOf,
    notOneOf: fieldDescription.notOneOf,
    default: fieldDescription.default,
    description: fieldDescription,
    tests: fieldDescription.tests,
  }

  const validatorExtractionFunc = getValidationExtractionFuncByType(type)

  if (!validatorExtractionFunc) return fieldProps

  // FIXME: There is no reason I shouldn't try and pickup props on custom tests
  // Test using precision custom validator for an example, and it should be fine
  // as users can provide their own types
  const customTests: SchemaDescription['tests'] = []
  fieldDescription.tests.forEach((test) => {
    if (!isValidTest(test)) return
    const newProps = validatorExtractionFunc(test)
    Object.assign(fieldProps, newProps)
    if(Object.keys(newProps).length === 0 ) {
      customTests.push(test)
    }
  })

  // Assign custom tests as long as they don't collide with other props,
  // and default params to true to match behavior of known validators
  customTests.forEach((test) => {
    if(Object.hasOwn(fieldProps, test.name || '')) {
      return
    }
    Object.assign(fieldProps, {[test.name || '']: test.params ?? true})
  })

  if (type === 'array') {
    const of = (fieldDescription as any).innerType as SchemaDescription
    if (of) {
      fieldProps.of = getPropsFromFieldDescription(of)
    }
  }

  return fieldProps as T
}

export const getPropsFromFieldPathAndSchemaDescription = <
  T extends FieldProps = AllFieldProps,
>(
  path: string,
  description: SchemaObjectDescription,
) => {
  const fieldDescription = getFieldDescriptionFromPath(path, description)
  return getPropsFromFieldDescription<T>(fieldDescription)
}

export const getPropsFromFieldNameAndSchemaDescription = <
  T extends FieldProps = AllFieldProps,
>(
  name: string,
  description: SchemaObjectDescription,
) => {
  const fieldDescription = getFieldDescriptionFromName(name, description)
  return getPropsFromFieldDescription<T>(fieldDescription)
}
