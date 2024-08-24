import { validNumberParam } from '../utils'
import { ExtractorArgs } from './types'
import { resolveRefForExtractor } from '../resolveRef'

export const extractStringValidationFromTest = ({
  test,
  values,
  name,
  context,
}: ExtractorArgs) => {
  switch (test.name) {
    case 'min':
    case 'max':
    case 'length':
      return resolveRefForExtractor({
        param: test.params?.[test.name],
        values,
        name,
        context,
        key: test.name,
        typeCheck: validNumberParam,
        toStrictType: Number,
      })
    case 'matches':
      return resolveRefForExtractor({
        param: test.params?.regex,
        values,
        name,
        context,
        key: 'matches',
        typeCheck: (val) => val instanceof RegExp,
      })
    case 'email':
      return { email: true }
    case 'url':
      return { url: true }
    case 'uuid':
      return { uuid: true }
    case 'datetime':
      return { datetime: true }
    case 'datetime_offset':
      return resolveRefForExtractor({
        param: test.params?.allowOffset,
        values,
        name,
        context,
        key: 'datetimeAllowOffset',
        typeCheck: 'boolean',
      })
    case 'datetime_precision':
      return resolveRefForExtractor({
        param: test.params?.precision,
        values,
        name,
        context,
        key: 'datetimePrecision',
        typeCheck: validNumberParam,
        toStrictType: Number,
      })
    default:
      return null
  }
}
