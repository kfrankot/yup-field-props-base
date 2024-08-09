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
    // etc...
  }

  const validatorExtractionFunc = getValidationExtractionFuncByType(type)

  if (!validatorExtractionFunc) return fieldProps

  fieldDescription.tests.forEach((test) => {
    if (!isValidTest(test)) return
    const newProps = validatorExtractionFunc(test)
    Object.assign(fieldProps, newProps)
  })

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
