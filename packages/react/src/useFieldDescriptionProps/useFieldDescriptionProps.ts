import { useMemo } from 'react'
import { AllFieldProps, FieldProps } from '../../../core/src/types'
import { useYupFieldDescription } from '../useFieldDescription'
import { getPropsFromFieldDescription } from '../../../core/src/getSchemaProps'

export const useYupFieldProps = <T extends FieldProps = AllFieldProps>(
  name: string,
) => {
  const fieldDescription = useYupFieldDescription(name)

  return useMemo(() => {
    return getPropsFromFieldDescription<T>(fieldDescription)
  }, [fieldDescription])
}
