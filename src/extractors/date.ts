import { SchemaDescription } from 'yup'

export const extractDateValidationFromTest = (
  test: SchemaDescription['tests'][0],
) => {
  switch (test.name) {
    case 'min':
      return test.params?.min
        ? { min: new Date(test.params?.min as string) }
        : {}
    case 'max':
      return test.params?.max
        ? { max: new Date(test.params?.max as string) }
        : {}
    default:
      return {}
  }
}
