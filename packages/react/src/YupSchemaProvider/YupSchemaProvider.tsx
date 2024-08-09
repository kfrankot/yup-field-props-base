import React, { useContext, createContext, useMemo, ReactNode } from 'react'
import { AnyObject, ObjectSchema, SchemaObjectDescription } from 'yup'

// TODO: Add support for generics
export type YupSchemaProviderProps = {
  schema: ObjectSchema<any, AnyObject, any, ''>
  values: any
  children: ReactNode
}

export const YupSchemaContext = createContext<{
  description: SchemaObjectDescription | null
}>({ description: null })

export const YupSchemaProvider = ({
  schema,
  values,
  children,
}: YupSchemaProviderProps) => {
  const context = useMemo(
    () => ({
      description: schema.describe({ value: values }),
    }),
    [schema, values],
  )
  return (
    <YupSchemaContext.Provider value={context}>
      {children}
    </YupSchemaContext.Provider>
  )
}

export const useYupSchemaContext = () => {
  return useContext(YupSchemaContext)
}
