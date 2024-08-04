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





import Ajv, { AnySchema, AnySchemaObject, SchemaObject, ValidateFunction } from 'ajv'

const JSON_SCHEMA_VALIDATION_KEYWORDS = [
  'type', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
  'minLength', 'maxLength', 'pattern', 'format', 'enum', 'const',
  'multipleOf', 'minItems', 'maxItems', 'uniqueItems', 'items',
  'contains', 'minProperties', 'maxProperties', 'required', 'properties',
  'additionalProperties', 'patternProperties', 'dependencies', 'propertyNames',
  'if', 'then', 'else', 'allOf', 'anyOf', 'oneOf', 'not'
] as const

// Object which has a key for each entry of JSON_SCHEMA_VALIDATION_KEYWORDS, with the value being the type of the keyword
type JSONSchemaValidationKeywords = {
  [K in typeof JSON_SCHEMA_VALIDATION_KEYWORDS[number]]?: any
}

export type FieldProps<Extras extends Record<string, unknown> = {}> = JSONSchemaValidationKeywords & Extras

export type FieldPropsMap<Extras extends Record<string, unknown> = {}> = Record<string, FieldProps<Extras>>;

export type NestedFieldPropsMap<Extras extends Record<string, unknown> = {}> = FieldPropsMap<{ properties?: FieldPropsMap<Extras> }>;

export type Values = Record<string, unknown>;

const ajv = new Ajv();

// Helper function to evaluate a schema against values
const evaluateSchema = (subSchema: SchemaObject, formValues: Values) => {
  const validate = ajv.compile(subSchema);
  validate(formValues);
  return validate.errors;
};

/**
 * Function to merge multiple schemas
 * @param {array} schemas - An array of schemas to merge.
 * @returns {object} - The merged schema.
 */
const mergeSchemas = (schemas: SchemaObject[]) => {
  return schemas.reduce((merged, schema) => {
    return { ...merged, ...schema, properties: { ...merged.properties, ...schema.properties } };
  }, {});
};

/**
 * Function to resolve conditionals and constraints in a schema
 * @param {object} schema - The JSON schema.
 * @param {object} values - The form values.
 * @returns {object} - The resolved schema.
 */
const resolveConditionals = (schema: SchemaObject, values: Values) => {
  let resolvedSchema = { ...schema };

  // Handle if/then/else
  if (resolvedSchema.if && (resolvedSchema.then || resolvedSchema.else)) {
    const ifValid = evaluateSchema(resolvedSchema.if, values);
    resolvedSchema = ifValid
      ? { ...resolvedSchema, ...resolvedSchema.then }
      : { ...resolvedSchema, ...resolvedSchema.else };
  }

  // Handle allOf
  if (resolvedSchema.allOf) {
    const mergedSchema = mergeSchemas(resolvedSchema.allOf.map((s: SchemaObject) => resolveConditionals(s, values)));
    resolvedSchema = { ...resolvedSchema, ...mergedSchema };
  }

  // Handle dependentRequired
  if (resolvedSchema.dependentRequired) {
    for (const key in resolvedSchema.dependentRequired) {
      if (values.hasOwnProperty(key)) {
        resolvedSchema.required = [...(resolvedSchema.required || []), ...resolvedSchema.dependentRequired[key]];
      }
    }
  }

  // Recursively resolve properties
  if (resolvedSchema.properties) {
    const resolvedProperties: SchemaObject = {};
    for (const key in resolvedSchema.properties) {
      resolvedProperties[key] = resolveConditionals(resolvedSchema.properties[key], values[key] as Values);
    }
    resolvedSchema.properties = resolvedProperties;
  }

  return resolvedSchema;
};

/**
 * Resolves which validations are being applied based on the current form values.
 * @param {object} schema - The JSON schema with conditionals.
 * @param {object} values - The form values to evaluate conditionals.
 * @returns {object} - The validations that are being applied.
 */
const getActiveValidations = (schema: SchemaObject, values: Values) => {

  // Function to get all constraints for a schema, recursively
  const getConstraints = (currentSchema: SchemaObject, parentRequired: string[] = []) => {
    const constraints: NestedFieldPropsMap = {};

    // Merge required properties
    const requiredProperties = currentSchema.required ? [...parentRequired, ...currentSchema.required] : parentRequired;

    for (const key in currentSchema.properties) {
      const propertySchema = currentSchema.properties[key];
      constraints[key] = { required: requiredProperties.includes(key) };

      for (const keyword of JSON_SCHEMA_VALIDATION_KEYWORDS) {
        if (propertySchema[keyword] !== undefined) {
          constraints[key][keyword] = propertySchema[keyword];
        }
      }

      // Recursively get constraints for nested properties
      if (propertySchema.properties) {
        constraints[key].properties = getConstraints(propertySchema, requiredProperties);
      }
    }

    return constraints;
  };

  const resolvedSchema = resolveConditionals(schema, values);
  const constraints = getConstraints(schema);
  const resolvedConstraints = getConstraints(resolvedSchema);

  // Combine constraints from both initial and resolved schema, recursively
  const combineConstraints = (baseConstraints: NestedFieldPropsMap, newConstraints: NestedFieldPropsMap) => {
    for (const key in newConstraints) {
      if (!baseConstraints[key]) {
        baseConstraints[key] = newConstraints[key];
      } else {
        baseConstraints[key] = {
          ...baseConstraints[key],
          ...newConstraints[key],
          properties: newConstraints[key].properties
            ? combineConstraints(
                baseConstraints[key].properties || {},
                newConstraints[key].properties
              )
            : undefined
        };
      }
    }
    return baseConstraints;
  };

  const combinedConstraints = combineConstraints(constraints, resolvedConstraints);

  // flatten constraints into key.nested1.nested2 format
  const flattenConstraints = (constraints: NestedFieldPropsMap, path = '') => {
    const flattened: FieldPropsMap = {};

    for (const key in constraints) {
      const newPath = path ? `${path}.${key}` : key;
      flattened[newPath] = constraints[key];

      if (constraints[key].properties) {
        const nestedConstraints = flattenConstraints(constraints[key].properties, newPath);
        Object.assign(flattened, nestedConstraints);
      }
    }

    return flattened;
  };

  return flattenConstraints(combinedConstraints);
};





/*const getValidationsFromProperties = (property: any) => {
  const validations: FieldProps = {};
  if (property.minimum !== undefined) {
    validations.min = property.minimum;
  }
  if (property.maximum !== undefined) {
    validations.max = property.maximum;
  }
  return validations
}

const extractValidations = (schema: SchemaObject, values: Record<string, unknown>) => {
  const ajv = new Ajv();
  let currentSchema = schema;
  const bla = ajv.compile(currentSchema);
  ajv.addSchema(currentSchema);
  ajv.getSchema(currentSchema.$id as string);
  const res = bla(values);

  if (schema.if && schema.then && schema.else) {
    const ifValid = ajv.compile(schema.if)(values);
    currentSchema = ifValid ? schema.then : schema.else;
  }

  const validations: FieldPropsMap = {};

  const traverse = (schema: SchemaObject, path = '') => {
    if (schema.properties) {
      for (const key in schema.properties) {
        const newPath = path ? `${path}.${key}` : key;
        const property = schema.properties[key];
        const newValidations = getValidationsFromProperties(property);
        validations[newPath] = { ...validations[newPath], ...newValidations };

        if (property.properties) {
          traverse(property, newPath);
        }
      }
    }
  };

  traverse(currentSchema);
  return validations;
}

const extractValidationsFromAjvAtPath = (ajv: Ajv, path: string, values: Record<string, unknown>) => {

}*/

// create a json schema for me.  It should have 2 values, a and b.  They should both be numbers, but b should only be required if a is present
const schema: SchemaObject = {
  $id: 'test',
  type: 'object',
  properties: {
    a: { type: 'number' },
    b: { type: 'number' },
  },
  required: ['a'],
  if: { required: ['a'] },
  then: { required: ['b'] },
}


getActiveValidations(schema, { a: 1, b: 2 });