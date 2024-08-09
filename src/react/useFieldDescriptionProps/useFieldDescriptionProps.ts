import { useMemo } from 'react'
import { AllFieldProps, FieldProps } from '../../types'
import { useYupFieldDescription } from '../useFieldDescription'
import { getPropsFromFieldDescription } from '../../getSchemaProps'

export const useYupFieldProps = <T extends FieldProps = AllFieldProps>(
  name: string,
) => {
  const fieldDescription = useYupFieldDescription(name)

  return useMemo(() => {
    return getPropsFromFieldDescription<T>(fieldDescription)
  }, [fieldDescription])
}
