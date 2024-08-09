import { useMemo } from 'react'
import { useYupSchemaContext } from '../YupSchemaProvider'
import {
  getFieldDescriptionFromPath,
  getFieldDescriptionPathFromName,
} from '../../getSchemaProps'

export const useYupFieldDescription = (name: string) => {
  const { description } = useYupSchemaContext()

  const pathToDescription = useMemo(() => {
    return getFieldDescriptionPathFromName(name)
  }, [name])

  return useMemo(() => {
    return description
      ? getFieldDescriptionFromPath(pathToDescription, description)
      : null
  }, [description, pathToDescription])
}
