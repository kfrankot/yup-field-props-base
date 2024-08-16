import { SchemaDescription } from 'yup'

export const extractStringValidationFromTest = (
  test: SchemaDescription['tests'][0],
) => {
  switch (test.name) {
    case 'min':
      return test.params?.min ? { min: test.params.min as number } : {}
    case 'max':
      return test.params?.max ? { max: test.params.max as number } : {}
    case 'length':
      return test.params?.length ? { length: test.params.length as number } : {}
    case 'matches':
      return test.params?.regex ? { matches: test.params.regex as RegExp } : {}
    case 'email':
      return { email: true }
    case 'url':
      return { url: true }
    case 'uuid':
      return { uuid: true }
    case 'datetime':
      return { datetime: true }
    case 'datetime_offset':
      return test.params?.allowOffset
        ? { datetimeAllowOffset: test.params.allowOffset as boolean }
        : {}
    case 'datetime_precision':
      return test.params?.precision
        ? { datetimePrecision: test.params.precision as number }
        : {}
    default:
      return {}
  }
}
