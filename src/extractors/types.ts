import { AnyObject, SchemaDescription } from 'yup'

export type ExtractorArgs = {
  test: SchemaDescription['tests'][0]
  values: any
  name: string
  context?: AnyObject
}
