import { SchemaDescription } from 'yup'

export interface FieldProps {
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

export interface MixedFieldProps extends FieldProps {}

export interface NumberFieldProps extends FieldProps {
  min?: number
  max?: number
  lessThan?: number
  moreThan?: number
  integer?: boolean
}

export interface DateFieldProps extends FieldProps {
  min?: Date
  max?: Date
}

export interface ArrayFieldProps<Of extends FieldProps = FieldProps>
  extends FieldProps {
  of?: Of
  min?: number
  max?: number
  length?: number
  ensure?: boolean
}

export interface StringFieldProps extends FieldProps {
  min?: number
  max?: number
  length?: number
  matches?: RegExp
  email?: boolean
  url?: boolean
  uuid?: boolean
  datetime?: boolean
  datetimeAllowOffset?: boolean
  datetimePrecision?: number
}

export type AllFieldProps = MixedFieldProps &
  NumberFieldProps &
  DateFieldProps &
  ArrayFieldProps &
  StringFieldProps
