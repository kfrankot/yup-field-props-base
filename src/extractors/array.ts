import { ExtractorArgs } from './types'
import { resolveRefForExtractor } from '../resolveRef'
import { validNumberParam } from '../utils'

export const extractArrayValidationFromTest = ({
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
    default:
      return null
  }
}
