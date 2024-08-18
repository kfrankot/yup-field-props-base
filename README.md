# Yup Field Props Base

Yup field props base is a library meant to simplify the collection of validation properties of a yup schema field, based on the current form state, so that the schema can be used as the single source of truth for assistive form UIs. Primarily meant to be used by `yup-field-props-react`, rather than as a standalone.

## Installation

To install the library, use npm or yarn:

```bash
npm install yup-field-props-base
```

# `getFieldProps` Function

The `getFieldProps` function is a utility that generates field properties for a given field name based on a Yup schema. It helps in managing form field properties and validation in React applications.

## Description

The `getFieldProps` function takes a field name, a Yup schema, and other optional parameters to generate the properties for that field. It uses the schema to determine the field's validation rules and other properties, making it easier to manage form fields in a consistent manner.

## Parameters

- `name` (string): The name of the field for which properties are being generated.
- `schema` (ObjectSchema): The Yup schema that defines the validation rules and properties for the field.
- `values` (any): The current values of the form fields.
- `context` (any, optional): Additional context that may be needed for validation.
- `throwError` (boolean, optional): Whether to throw an error or return default field properties in case of an error. Defaults to `false`.

## Return Value

The function returns an object containing the properties for the specified field. The properties include validation rules and other relevant information derived from the Yup schema.

## Usage

Here is an example of how to use the `getFieldProps` function:

```typescript
import { getFieldProps } from './getFieldProps'
import * as yup from 'yup'

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  age: yup
    .number()
    .required('Age is required')
    .min(13, 'You are not old enough')
    .max(120, 'This is too old'),
  email: yup.string().email().required(),
  username: yup.string().oneOf([yup.ref('name'), yup.ref('email')]),
  phoneNumber: yup.string().when('age', ([age], schema) => {
    return age >= 18 ? schema.required() : schema
  }),
})

const values = {
  name: 'Kevin',
  age: 20,
  email: 'test-email@gmail.com',
  username: 'test-email@gmail.com',
  phoneNumber: '(123)-456-7890',
}

const ageProps = getFieldProps<NumberFieldProps>({
  name: 'age',
  schema,
  values: { name: '', age: '' },
  context: {},
})

const usernameProps = getFieldProps<StringFieldProps>({
  name: 'username',
  schema,
  values,
  context: {},
})

const phoneNumberProps = getFieldProps<StringFieldProps>({
  name: 'phoneNumber',
  schema,
  values,
  context: {},
})
```

These props output the following

```typescript
console.log(ageProps)
/*
{
  type: 'number',
  required: true,
  nullable: false,
  oneOf: [],
  notOneOf: [],
  tests: [
    { name: 'min', params: [Object] },
    { name: 'max', params: [Object] }
  ],
  min: 13,
  max: 120
}
*/
console.log(usernameProps)
/*
{
  type: 'string',
  required: false,
  nullable: false,
  oneOf: [ 'Kevin', 'test-email@gmail.com' ],
  notOneOf: [],
  tests: []
}
*/
console.log(phoneNumberProps)
/*
{
  type: 'string',
  required: true,
  nullable: false,
  oneOf: [],
  notOneOf: [],
  tests: [ { name: 'required', params: undefined } ]
}
*/
```
