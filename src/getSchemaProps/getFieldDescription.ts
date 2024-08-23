import { AnyObject, ObjectSchema, reach, SchemaDescription } from 'yup'
import { get, throwOrReturn } from '../utils'

export const getFieldPathsFromName = (name: string) => {
  const parts = name.split('.')
  const parentPath = parts.slice(0, parts.length - 1).join('.')
  const valuePath = parts[parts.length - 1]
  return { valuePath, parentPath }
}

export const getFieldDescription = ({
  name,
  schema,
  values,
  context,
  throwError = false,
}: {
  name: string
  schema: ObjectSchema<any, AnyObject, any, ''>
  values: any
  context?: AnyObject
  throwError?: boolean
}) => {
  try {
    const { valuePath, parentPath } = getFieldPathsFromName(name)
    const parent = parentPath ? get(values, parentPath) : values
    const value = get(parent, valuePath)

    const fieldSchema = reach(schema, name, values, context)
    // TODO: Figure out why this type cast is necessary
    return fieldSchema.describe({ value, parent, context }) as SchemaDescription
  } catch (error) {
    return throwOrReturn(error, throwError, null)
  }
}

export const getFieldDescriptionFromPaths = ({
  valuePath,
  parentPath,
  schema,
  values,
  context,
  throwError = false,
}: {
  valuePath: string
  parentPath: string
  schema: ObjectSchema<any, AnyObject, any, ''>
  values: any
  context?: AnyObject
  throwError?: boolean
}) => {
  try {
    const parent = parentPath ? get(values, parentPath) : values
    const value = get(parent, valuePath)

    const fieldSchema = reach(
      schema,
      parentPath ? parentPath + '.' + valuePath : valuePath,
      values,
      context,
    )
    return fieldSchema.describe({ value, parent, context }) as SchemaDescription
  } catch (error) {
    return throwOrReturn(error, throwError, null)
  }
}
