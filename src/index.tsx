// I clearly need to scope this down.  In order to acheive this with a JSON schema, I clearly would need to essentially replicate
// the schema parsing logic of AJV, which is not ideal.  It would be better to do a more pracitcal example, such as something that would
// at least work with one commonly used library.  It looks like yup is getting more stable, and even has a type definition for its yup.describe
// function, so I could try to use that instead https://github.com/jquense/yup?tab=readme-ov-file#schemadescribeoptions-resolveoptions-schemadescription

// Despite what I initially believed, the yup library's describe function, with value prop, is actually quite unique and very powerful, despite
// not being prominently displayed in the docs.  This significantly alters the scope of what I am trying to do, so I should instead focus
// on utilizing this functionality to enhance the library when being used with React

// Should try and make it work generically with the test functions

// This may also allow for getting attention from the yup developer, which could be useful for promoting the project

// Should try and make it work with React, with examples and easy support for Formik and react-hook-form adapters (with useWatch() or form.getValues())
  // Possible that I could just add Formik or react-hook-form as optional peer dependencies


// proposed name: use-yup-field-props, use-yup-schema-description, react-yup-field-props

import React, { ReactNode, createContext, useContext, useMemo } from 'react'
import { AnyObject, AnySchema, ObjectSchema, Schema, SchemaDescription, SchemaObjectDescription } from 'yup'
import { get } from 'lodash'

type TestDefinition = {
  name: string;
  params: Record<string, unknown>;
}

type NotValidatedTestDefinition = Partial<TestDefinition>

// TODO: Add support for generics
export type SchemaProviderProps = {
  schema: ObjectSchema<any, AnyObject, any, ''>;
  values: any;
  children: ReactNode;
}

export type FieldProps = {
  type?: string
  required?: boolean;
  nullable?: boolean;
  oneOf: any[];
  notOneOf: any[];
  default?: any;
  tests?: {
    name?: string;
    params: Record<string, unknown> | undefined;
  }[]
}

export type MixedFieldProps = FieldProps

export type NumberFieldProps = FieldProps & {
  min?: number;
  max?: number;
  lessThan?: number
  moreThan?: number
  integer?: boolean;
}

export const YupSchemaContext = React.createContext<{ description: SchemaObjectDescription | null }>({ description: null });

export const YupSchemaProvider = ({ schema, values, children }: SchemaProviderProps) => {
  const context = useMemo(() => ({
    description: schema.describe({ value: values })
  }), [schema, values]);
  return <YupSchemaContext.Provider value={context}>{children}</YupSchemaContext.Provider>
}

export const useYupSchema = () => {
  return useContext(YupSchemaContext);
}

export const useYupFieldDescription = (name: string) => {
  const { description } = useYupSchema();

  const pathToDescription = useMemo(() => {
    return name.split('.').join('.fields.');
  }, [name]);
  
  return useMemo(() => {
    return get(description?.fields, pathToDescription, null) as SchemaDescription | null;
  }, [description, pathToDescription]);
}

const extractArrayValidationFromTest = (test: TestDefinition) => {
  switch (test.name) {
    case 'of':
      return test.params?.of ? { type: test.params.of as AnySchema } : {};
    case 'min':
      return test.params?.min ? { min: test.params.min as number } : {};
    case 'max':
      return test.params?.max ? { max: test.params.max as number } : {};
    case 'length':
      return test.params?.length ? { length: test.params.length as number } : {};
    case 'ensure':
      return { ensure: true };
    default:
      return {};
  }
}

const extractStringValidationFromTest = (test: TestDefinition) => {
  // the string validators for email, url, and uuid are all regex under the hood.
  // Should I just return regex for all of them, or instead overwrite with the explicit validation type?
  // Probably should just return the exact type for all of them, it will make it easier to understand

  // The point of this library is just to support easier interfacing with yup, they don't actually want to show
  // some huge regex to a user, but instead just show them the type of validation that is being done
  switch (test.name) {
    case 'min':
      return test.params?.min ? { min: test.params.min as number } : {};
    case 'max':
      return test.params?.max ? { max: test.params.max as number } : {};
    case 'length':
      return test.params?.length ? { length: test.params.length as number } : {};
    case 'matches':
      return test.params?.regex ? { matches: test.params.regex as RegExp } : {};
    case 'email':
      return { email: true };
    case 'url':
      return { url: true };
    case 'uuid':
      return { uuid: true };
    case 'datetime':
      return { datetime: true };
    case 'datetime_offset':
      return test.params?.allowOffset ? { datetimeAllowOffset: test.params.allowOffset as boolean } : {};
    case 'datetime_precision':
      return test.params?.precision ? { datetimePrecision: test.params.precision as number } : {};
    default:
      return {};
  }
}

// TODO: Should I validate the date values, or should I remove validation from the number validation functions?
const extractDateValidationFromTest = (test: TestDefinition) => {
  switch (test.name) {
    case 'min':
      return test.params?.min ? { min: new Date(test.params?.min as string) } : {};
    case 'max':
      return test.params?.max ? { max: new Date(test.params?.max as string) } : {};
    default:
      return {};
  }
}

const validNumberParam = (value: unknown) => typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);

const extractNumberValidationFromTest = (test: TestDefinition) => {
  switch (test.name) {
    case 'min':
      if(test.params?.min !== undefined) {
        return validNumberParam(test.params?.min) ? { min: test.params?.min as number } : {};
      }
      else if(test.params?.more !== undefined) {
        return validNumberParam(test.params?.more) ? { moreThan: test.params?.more as number } : {};
      }
      return {}
    case 'max':
      if(test.params?.max !== undefined) {
        return validNumberParam(test.params?.max) ? { max: test.params?.max as number } : {};
      }
      else if(test.params?.less !== undefined) {
        return validNumberParam(test.params?.less) ? { lessThan: test.params?.less as number } : {};
      }
      return {}
    case 'integer':
      return { integer: true };
    default:
      return {};
  }
}

const getValidatorExtractionFuncByType = (type: string) => {
  switch (type) {
    case 'string':
      return extractStringValidationFromTest;
    case 'array':
      return extractArrayValidationFromTest;
    case 'number':
      return extractNumberValidationFromTest;
    case 'date':
      return extractDateValidationFromTest;
    default:
      return null;
  }
}

const isValidTest = (test: NotValidatedTestDefinition) => {
  // if (!test.name) return {};
  // if (!test.params) return {};
  return !!test.name;
}

// based on the "type" prop, define an extension of the base FieldProps type
// For example, if it is a number, min and max should be numbers, if it is a date, min and max should be dates (or string?), etc...

// We can still return the tests array, but it should only be for unexpected tests such as custom validators...

export const useYupFieldProps = <T extends FieldProps>(name: string) => {
  const fieldDescription = useYupFieldDescription(name);

  return useMemo(() => {
    if (!fieldDescription) return {} as FieldProps;

    const type = fieldDescription.type;
    const fieldProps: FieldProps = {
      type,
      required: !fieldDescription.optional,
      nullable: fieldDescription.nullable,
      oneOf: fieldDescription.oneOf,
      notOneOf: fieldDescription.notOneOf,
      default: fieldDescription.default,
      tests: fieldDescription.tests
      // etc...
    }

    const validatorExtractionFunc = getValidatorExtractionFuncByType(type);

    if(!validatorExtractionFunc) return fieldProps;

    fieldDescription.tests.forEach((test) => {
      if(!isValidTest(test)) return;
      const newProps = validatorExtractionFunc(test as TestDefinition);
      Object.assign(fieldProps, newProps);
    })

    // fieldDescription.tests.forEach((test) => {
    //   const newProps = extractPropsFromTest(test);
    //   Object.assign(fieldProps, newProps);
    // })

    return fieldProps as T;
  }, [fieldDescription]);
}