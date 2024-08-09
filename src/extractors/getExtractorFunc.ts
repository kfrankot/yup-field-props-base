import { extractStringValidationFromTest } from './string'
import { extractNumberValidationFromTest } from './number'
import { extractArrayValidationFromTest } from './array'
import { extractDateValidationFromTest } from './date'

export const getValidationExtractionFuncByType = (type: string) => {
  switch (type) {
    case 'string':
      return extractStringValidationFromTest
    case 'array':
      return extractArrayValidationFromTest
    case 'number':
      return extractNumberValidationFromTest
    case 'date':
      return extractDateValidationFromTest
    default:
      return null
  }
}
