import { validNumberParam } from '../utils'
import { resolveRefForExtractor } from '../resolveRef'
import { ExtractorArgs } from './types'

export const extractNumberValidationFromTest = ({
  test,
  values,
  name,
  context,
}: ExtractorArgs) => {
  switch (test.name) {
    case 'min':
      if (test.params?.min !== undefined) {
        return resolveRefForExtractor({
          param: test.params.min,
          values,
          name,
          context,
          key: 'min',
          typeCheck: validNumberParam,
          toStrictType: Number,
        })
      } else if (test.params?.more !== undefined) {
        return resolveRefForExtractor({
          param: test.params.more,
          values,
          name,
          context,
          key: 'moreThan',
          typeCheck: validNumberParam,
          toStrictType: Number,
        })
      }
      return {}
    case 'max':
      if (test.params?.max !== undefined) {
        return resolveRefForExtractor({
          param: test.params.max,
          values,
          name,
          context,
          key: 'max',
          typeCheck: validNumberParam,
          toStrictType: Number,
        })
      } else if (test.params?.less !== undefined) {
        return resolveRefForExtractor({
          param: test.params.less,
          values,
          name,
          context,
          key: 'lessThan',
          typeCheck: validNumberParam,
          toStrictType: Number,
        })
      }
      return {}
    case 'integer':
      return { integer: true }
    default:
      return null
  }
}
