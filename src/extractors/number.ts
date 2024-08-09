import { SchemaDescription } from 'yup'

const validNumberParam = (value: unknown) =>
  typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)

export const extractNumberValidationFromTest = (
  test: SchemaDescription['tests'][0],
) => {
  switch (test.name) {
    case 'min':
      if (test.params?.min !== undefined) {
        return validNumberParam(test.params?.min)
          ? { min: test.params?.min as number }
          : {}
      } else if (test.params?.more !== undefined) {
        return validNumberParam(test.params?.more)
          ? { moreThan: test.params?.more as number }
          : {}
      }
      return {}
    case 'max':
      if (test.params?.max !== undefined) {
        return validNumberParam(test.params?.max)
          ? { max: test.params?.max as number }
          : {}
      } else if (test.params?.less !== undefined) {
        return validNumberParam(test.params?.less)
          ? { lessThan: test.params?.less as number }
          : {}
      }
      return {}
    case 'integer':
      return { integer: true }
    default:
      return {}
  }
}
