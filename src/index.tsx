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

// TODO: Split react code into separate repo that contains the core as a dependency
export * from './getSchemaProps'
export * from './react'
export * from './types'
