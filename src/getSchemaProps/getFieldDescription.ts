import { SchemaDescription, SchemaObjectDescription } from 'yup'
import { get } from 'lodash'

export const getFieldDescriptionPathFromName = (name: string) => {
  return name.split('.').join('.fields.')
}

export const getFieldDescriptionFromPath = (
  path: string,
  description: SchemaObjectDescription,
) => {
  return get(description?.fields, path, null) as SchemaDescription | null
}

export const getFieldDescriptionFromName = (
  name: string,
  description: SchemaObjectDescription,
) => {
  return getFieldDescriptionFromPath(
    getFieldDescriptionPathFromName(name),
    description,
  )
}
