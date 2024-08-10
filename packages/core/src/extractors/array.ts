import { SchemaDescription } from 'yup'

export const extractArrayValidationFromTest = (
  test: SchemaDescription['tests'][0],
) => {
  switch (test.name) {
    case 'min':
      return test.params?.min ? { min: test.params.min as number } : {}
    case 'max':
      return test.params?.max ? { max: test.params.max as number } : {}
    case 'length':
      return test.params?.length ? { length: test.params.length as number } : {}
    default:
      return {}
  }
}
