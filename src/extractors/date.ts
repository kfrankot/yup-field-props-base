import { resolveRef } from '../resolveRef'
import { ExtractorArgs } from './types'

const isValidDate = (date: Date) => {
  return date instanceof Date && !isNaN(date.getTime())
}

export const extractDateValidationFromTest = ({
  test,
  values,
  name,
  context,
}: ExtractorArgs) => {
  switch (test.name) {
    case 'min':
    case 'max': {
      const value = resolveRef({
        param: test.params?.[test.name],
        values,
        name,
        context,
      })
      const date = new Date(value)
      return isValidDate(date) ? { [test.name]: date } : {}
    }
    default:
      return null
  }
}
