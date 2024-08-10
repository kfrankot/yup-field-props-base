import React, {
  useContext,
  createContext,
  useMemo,
  useRef,
  ReactNode,
} from 'react'
import { AnyObject, ObjectSchema, SchemaObjectDescription } from 'yup'
import fastDeepEqual from 'fast-deep-equal/es6'

// TODO: Add support for generics
export type YupSchemaProviderProps = {
  schema: ObjectSchema<any, AnyObject, any, ''>
  values: any
  disableDeepEqualCheck?: boolean
  children: ReactNode
}

export const YupSchemaContext = createContext<{
  description: SchemaObjectDescription | null
}>({ description: null })

export const YupSchemaProvider = ({
  schema,
  values,
  disableDeepEqualCheck,
  children,
}: YupSchemaProviderProps) => {
  const context = useMemo(
    () => ({
      description: schema.describe({ value: values }),
    }),
    [schema, values],
  )

  // Its very likely the describe method will be the exact same despite the schema and values changing
  // so provide some protection to avoid unnecessary re-renders on every input change

  // TODO: Need to verify performance improvement
  const contextRef = useRef(context)
  if (
    disableDeepEqualCheck ||
    (contextRef.current !== context &&
      !fastDeepEqual(contextRef.current, context))
  ) {
    contextRef.current = context
  }

  return (
    <YupSchemaContext.Provider value={contextRef.current}>
      {children}
    </YupSchemaContext.Provider>
  )
}

export const useYupSchemaContext = () => {
  return useContext(YupSchemaContext)
}
