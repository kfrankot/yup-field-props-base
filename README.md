# Yup Field Props Base

Yup Field Props Base is a library designed to simplify extracting validation properties from a Yup schema field based on current form state. This allows your schema to serve as the single source of truth for assistive form UIs. It's primarily intended to be used with `yup-field-props-react` rather than as a standalone library.

## Installation

Install the library using npm or yarn:

```bash
npm install yup-field-props-base
# or
yarn add yup-field-props-base
```

# `getFieldProps` Function

The `getFieldProps` function generates field properties for a specified field name based on a Yup schema, making form field validation management more straightforward.

## Description

This utility function takes a field name, a Yup schema, and additional parameters to generate properties for the specified field. By analyzing the schema, it determines validation rules and other field properties, enabling consistent form field management.

## Parameters

- `name` (string): The name of the field for which to generate properties
- `schema` (ObjectSchema): The Yup schema defining validation rules
- `values` (any): Current values of all form fields
- `context` (AnyObject, optional): Additional context for validation
- `throwError` (boolean, optional): Whether to throw errors (true) or return default field properties (false, default) on failure

## Return Value

Returns an object containing the properties for the specified field, including validation rules and other relevant information derived from the Yup schema.

## Usage

Here's how to use the `getFieldProps` function:

1. Import the necessary modules:

```typescript
import { getFieldProps } from 'yup-field-props-base'
import * as yup from 'yup'
import type { NumberFieldProps, StringFieldProps } from 'yup-field-props-base'
```

2. Define your Yup schema with validation rules:

```typescript
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  age: yup
    .number()
    .required('Age is required')
    .min(13, 'You are not old enough')
    .max(120, 'This is too old'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  username: yup
    .string()
    .oneOf([yup.ref('name'), yup.ref('email')], 'Must match name or email'),
  phoneNumber: yup.string().when('age', ([age], schema) => {
    return age >= 18
      ? schema.required('Phone number required for adults')
      : schema
  }),
})
```

3. Set the values for your form fields:

```typescript
const values = {
  name: 'Kevin',
  age: 20,
  email: 'kevin@example.com',
  username: 'kevin@example.com',
  phoneNumber: '(123)-456-7890',
}
```

4. Generate the field properties using the `getFieldProps` function:

```typescript
// Get properties for a number field
const ageProps = getFieldProps<NumberFieldProps>({
  name: 'age',
  schema,
  values: { name: '', age: '' }, // Empty values to check validation
  context: {},
})

// Get properties for a string field with references
const usernameProps = getFieldProps<StringFieldProps>({
  name: 'username',
  schema,
  values,
  context: {},
})

// Get properties for a field with conditional validation
const phoneNumberProps = getFieldProps<StringFieldProps>({
  name: 'phoneNumber',
  schema,
  values,
  context: {},
})
```

5. Use the generated field properties:

```typescript
console.log(ageProps)
console.log(usernameProps)
console.log(phoneNumberProps)
```

Example output:

```javascript
{
  type: 'number',
  required: true,
  nullable: false,
  oneOf: [],
  notOneOf: [],
  tests: [
    { name: 'min', params: { min: 13 } },
    { name: 'max', params: { max: 120 } }
  ],
  min: 13,
  max: 120
}

{
  type: 'string',
  required: false,
  nullable: false,
  oneOf: ['Kevin', 'kevin@example.com'],
  notOneOf: [],
  tests: []
}

{
  type: 'string',
  required: true,
  nullable: false,
  oneOf: [],
  notOneOf: [],
  tests: [{ name: 'required', params: undefined }]
}
```
