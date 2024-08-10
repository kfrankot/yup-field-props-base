import { SchemaDescription } from 'yup'

export type FieldProps = {
  type: string
  required: boolean
  nullable: boolean
  oneOf: any[]
  notOneOf: any[]
  default?: any
  description: SchemaDescription
  tests: {
    name?: string
    params: Record<string, unknown> | undefined
  }[]
}

export type MixedFieldProps = FieldProps

export type NumberFieldProps = FieldProps & {
  min?: number
  max?: number
  lessThan?: number
  moreThan?: number
  integer?: boolean
}

export type DateFieldProps = FieldProps & {
  min?: Date
  max?: Date
}

export type ArrayFieldProps<Of extends FieldProps = FieldProps> = FieldProps & {
  of?: Of
  min?: number
  max?: number
  length?: number
  ensure?: boolean
}

export type AllFieldProps = MixedFieldProps &
  NumberFieldProps &
  DateFieldProps &
  ArrayFieldProps
