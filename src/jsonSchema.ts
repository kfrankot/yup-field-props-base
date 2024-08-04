// NOTES: Obvious approach that will be much more maintainable, less code, easier support for multiple schema types (but maybe worse performance?)
// will be to do this with just the JSON schema specs using the AJV library, which will allow for 1 main implementation, along with a user
// provided adapter for converting to a JSON schema, rather than myself needing to create adapters.  If this is possible, it will be much
// preferable to the initial approach, which would be to have an adapter for each schema library, which do not have the same structure or API.

// Again, while performance when just relying on ajv + JSON schema may be worse, nobody would be using this tool if the main concern was
// super good performance, rather than just to use as a convenience tool for getting properties from the schema.  Of course, if performance
// is too bad, then even convenience for small forms could be a problem, but I think it's worth trying to see if it's possible to do this


// const extractValidations = (schema, values) => {
//   const ajv = new Ajv();
//   let currentSchema = schema;

//   if (schema.if && schema.then && schema.else) {
//     const ifValid = ajv.compile(schema.if)(values);
//     currentSchema = ifValid ? schema.then : schema.else;
//   }

//   const validations = {};

//   const traverse = (schema, path = '') => {
//     if (schema.properties) {
//       for (const key in schema.properties) {
//         const newPath = path ? `${path}.${key}` : key;
//         const property = schema.properties[key];

//         if (property.minimum !== undefined) {
//           validations[newPath] = { ...validations[newPath], min: property.minimum };
//         }
//         if (property.maximum !== undefined) {
//           validations[newPath] = { ...validations[newPath], max: property.maximum };
//         }
//         if (property.description) {
//           validations[newPath] = { ...validations[newPath], description: property.description };
//         }

//         if (property.properties) {
//           traverse(property, newPath);
//         }
//       }
//     }
//   };

//   traverse(currentSchema);
//   return validations;
// };