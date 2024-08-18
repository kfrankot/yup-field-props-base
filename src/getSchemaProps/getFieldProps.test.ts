import * as yup from 'yup'
import { getFieldPropsFromDescription, getFieldProps } from './getFieldProps'
import { getFieldDescription } from './getFieldDescription'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare module 'yup' {
  interface NumberSchema {
    precision(precision: number): NumberSchema
    isMidpoint(midpoint: number): NumberSchema
  }
}

yup.number.prototype.precision = function (this: any, precision: number) {
  return this.test({
    name: 'precision',
    exclusive: true,
    message: `\${path} must have a precision of ${precision} decimal places`,
    test: (value: number) => {
      if (typeof value !== 'number') return true
      const decimalPlaces = (value.toString().split('.')[1] || '').length
      return decimalPlaces <= precision
    },
    params: precision,
  })
}

yup.number.prototype.isMidpoint = function (this: any, midpoint: number) {
  return this.test({
    name: 'isMidpoint',
    exclusive: true,
    message: `\${path} must be the midpoint of ${midpoint}`,
    test: (value: number) => {
      if (typeof value !== 'number') return true
      return value * 2 === midpoint
    },
    params: { midpoint },
  })
}

describe('getFieldPropsFromDescription', () => {
  const customTest = ['customTest', () => true] as const
  const supportsDatetime = (yup.string() as any).datetime

  let nameSchema = yup
    .string()
    .required()
    .min(3)
    .max(50)
    .length(10)
    .matches(/^[a-zA-Z]+$/, { excludeEmptyString: true })
    .email()
    .url()
    .uuid()
    .test(...customTest)
  if (supportsDatetime) {
    nameSchema = (nameSchema as any).datetime({
      allowOffset: true,
      precision: 2,
    })
  }

  const schema = yup.object().shape({
    name: nameSchema,
    age: yup
      .number()
      .required()
      .min(18)
      .max(65)
      .integer()
      .default(30)
      .precision(2)
      .isMidpoint(30)
      .test(...customTest),
    ageExlusive: yup.number().moreThan(18).lessThan(65),
    birthdate: yup
      .date()
      .required()
      .min(new Date('2000-01-01'))
      .max(new Date('2020-12-31'))
      .test(...customTest),
    tags: yup
      .array()
      .of(yup.array().of(yup.string().required()).required())
      .min(1)
      .max(5)
      .length(2)
      .test(...customTest),
    confirmed: yup.boolean().required().default(false),
    oneOf: yup.string().oneOf(['one', 'two', 'three']),
    notOneOf: yup.string().notOneOf([yup.ref('name'), 'five', 'six']),
    nested: yup.object({
      nestedString: yup.string().required(),
      nestedNumber: yup.number().required(),
      nestedRef: yup
        .string()
        .min(yup.ref('age'))
        .max(yup.ref('nestedNumber'))
        .length(yup.ref('$someContext')),
    }),
    conditional: yup.string().when('nested.nestedString', ([nestedString]) => {
      return nestedString === 'foo' ? yup.string().required() : yup.string()
    }),
    otherNumber: yup.number(),
    refTest: yup
      .string()
      .min(yup.ref('age'))
      .max(yup.ref('otherNumber'))
      .length(yup.ref('$someContext')),
    oneOfRef: yup.string().oneOf([yup.ref('name'), 'bla']),
  })

  const defaultValues = {
    name: 'John',
    age: 30,
    birthdate: new Date('2000-05-15'),
    tags: ['tag1', 'tag2'],
    confirmed: false,
    oneOf: 'one',
    notOneOf: 'four',
    nested: {
      nestedString: 'nested',
      nestedNumber: 60,
      nestedRef: 'nested',
    },
    conditional: '',
    otherNumber: 50,
    refTest: 'refTest',
  }

  it('returns the correct field properties for a string field', () => {
    const description = getFieldDescription({
      name: 'name',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'name',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    const props = {
      type: 'string',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      customTest: true,
      email: true,
      length: 10,
      matches: /^[a-zA-Z]+$/,
      max: 50,
      min: 3,
      url: true,
      uuid: true,
      description: expect.any(Object),
      tests: expect.any(Array),
    }

    const datetimeProps = supportsDatetime
      ? {
          datetime: true,
          datetimeAllowOffset: true,
          datetimePrecision: 2,
        }
      : {}
    expect(result).toStrictEqual({
      ...props,
      ...datetimeProps,
    })
  })

  it('returns the correct field properties for a number field', () => {
    const description = getFieldDescription({
      name: 'age',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'age',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    expect(result).toStrictEqual({
      type: 'number',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: 30,
      customTest: true,
      max: 65,
      min: 18,
      integer: true,
      precision: 2,
      isMidpoint: { midpoint: 30 },
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a number field with exclusive tests', () => {
    const description = getFieldDescription({
      name: 'ageExlusive',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'ageExlusive',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    expect(result).toStrictEqual({
      type: 'number',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      moreThan: 18,
      lessThan: 65,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a boolean field', () => {
    const description = getFieldDescription({
      name: 'confirmed',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'confirmed',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    expect(result).toStrictEqual({
      type: 'boolean',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: false,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a date field', () => {
    const description = getFieldDescription({
      name: 'birthdate',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'birthdate',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    expect(result).toStrictEqual({
      type: 'date',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      customTest: true,
      max: new Date('2020-12-31'),
      min: new Date('2000-01-01'),
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for an array field', () => {
    const description = getFieldDescription({
      name: 'tags',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'tags',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    expect(result).toStrictEqual({
      type: 'array',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      length: 2,
      max: 5,
      min: 1,
      customTest: true,
      description: expect.any(Object),
      tests: expect.any(Array),
      of: {
        type: 'array',
        required: true,
        nullable: false,
        oneOf: [],
        notOneOf: [],
        description: expect.any(Object),
        tests: expect.any(Array),
        of: {
          type: 'string',
          required: true,
          nullable: false,
          oneOf: [],
          notOneOf: [],
          description: expect.any(Object),
          tests: expect.any(Array),
        },
      },
    })
  })

  it('returns the correct field properties for a nested field', () => {
    const description = getFieldDescription({
      name: 'nested.nestedString',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'nested.nestedString',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    expect(result).toStrictEqual({
      type: 'string',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a conditional field', () => {
    const description = getFieldDescription({
      name: 'conditional',
      schema,
      values: defaultValues,
    }) as yup.SchemaDescription
    const result = getFieldPropsFromDescription({
      name: 'conditional',
      fieldDescription: description,
      values: defaultValues,
      context: {},
    })

    const toEqual = {
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
    }

    expect(result).toStrictEqual(toEqual)

    const description2 = getFieldDescription({
      name: 'conditional',
      schema,
      values: { ...defaultValues, nested: { nestedString: 'foo' } },
    }) as yup.SchemaDescription
    const result2 = getFieldPropsFromDescription({
      name: 'conditional',
      fieldDescription: description2,
      values: { ...defaultValues, nested: { nestedString: 'foo' } },
      context: {},
    })

    expect(result2).toStrictEqual({
      ...toEqual,
      required: true,
    })
  })

  it('correctly evaluates refs and context in the schema', () => {
    const result = getFieldProps({
      name: 'refTest',
      schema,
      values: defaultValues,
      context: { someContext: 10 },
    })

    expect(result).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
      max: 50,
      min: 30,
      length: 10,
    })

    const result2 = getFieldProps({
      name: 'refTest',
      schema,
      values: {},
      context: {},
    })

    expect(result2).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
      max: undefined,
      min: undefined,
      length: undefined,
    })
  })

  it('correctly evaluates refs in nested fields', () => {
    const result = getFieldProps({
      name: 'nested.nestedRef',
      schema,
      values: defaultValues,
      context: { someContext: 10 },
    })

    expect(result).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
      max: 60,
      min: undefined,
      length: 10,
    })

    const result2 = getFieldProps({
      name: 'nested.nestedRef',
      schema,
      values: {},
      context: {},
    })

    expect(result2).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
      max: undefined,
      min: undefined,
      length: undefined,
    })
  })

  it('correctly evaluates refs in oneOf', () => {
    const result = getFieldProps({
      name: 'oneOfRef',
      schema,
      values: defaultValues,
      context: { someContext: 10 },
    })

    expect(result).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: ['John', 'bla'],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
    })

    const result2 = getFieldProps({
      name: 'oneOfRef',
      schema,
      values: {},
      context: {},
    })

    expect(result2).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [undefined, 'bla'],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('correctly evaluates refs in notOneOf', () => {
    const result = getFieldProps({
      name: 'notOneOf',
      schema,
      values: defaultValues,
      context: { someContext: 10 },
    })

    expect(result).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: ['John', 'five', 'six'],
      description: expect.any(Object),
      tests: expect.any(Array),
    })

    const result2 = getFieldProps({
      name: 'notOneOf',
      schema,
      values: {},
      context: {},
    })

    expect(result2).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [undefined, 'five', 'six'],
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('provides default props set when field does not exist', () => {
    const result = getFieldProps({
      name: 'nonExistentField',
      schema,
      values: defaultValues,
      context: {},
    })

    expect(result).toStrictEqual({
      type: 'mixed',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('throws error when field does not exist and throwError is true', () => {
    expect(() => {
      getFieldProps({
        name: 'nonExistentField',
        schema,
        values: defaultValues,
        context: {},
        throwError: true,
      })
    }).toThrow()
  })
})
