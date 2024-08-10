import { object, string, number, boolean, date, array } from 'yup'
import {
  getFieldDescriptionFromName,
  getPropsFromFieldDescription,
  getPropsFromFieldPathAndSchemaDescription,
  getPropsFromFieldNameAndSchemaDescription,
} from '.'

// add custom validator to yup for a number's decimal precision

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare module 'yup' {
  interface NumberSchema {
    precision(precision: number): NumberSchema
  }
}

number.prototype.precision = function (this: any, precision: number) {
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

describe('getFieldProps', () => {
  const customTest = ['customTest', () => true] as const
  const schema = object({
    name: string()
      .required()
      .min(3)
      .max(50)
      .length(10)
      .matches(/^[a-zA-Z]+$/, { excludeEmptyString: true })
      .email()
      .url()
      .uuid()
      .datetime({ allowOffset: true, precision: 2 })
      .test(...customTest),
    age: number()
      .required()
      .min(18)
      .max(65)
      .integer()
      .default(30)
      .precision(2)
      .test(...customTest),
    ageExclusive: number().nullable().lessThan(70).moreThan(10),
    birthdate: date()
      .required()
      .min(new Date('2000-01-01'))
      .max(new Date('2020-12-31'))
      .test(...customTest),
    tags: array()
      .of(array().of(string().required()).required())
      .min(1)
      .max(5)
      .length(2)
      .test(...customTest),
    confirmed: boolean().required().default(false),
    oneOf: string().oneOf(['one', 'two', 'three']),
    notOneOf: string().notOneOf(['four', 'five', 'six']),
    nested: object({
      nestedString: string().required(),
    }),
    conditional: string().when('nested.nestedString', ([nestedString]) => {
      return nestedString === 'foo' ? string().required() : string()
    }),
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
    },
    conditional: '',
  }

  it('returns the correct field properties for a string field', () => {
    const description = getFieldDescriptionFromName(
      'name',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'string',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      min: 3,
      max: 50,
      length: 10,
      matches: /^[a-zA-Z]+$/,
      email: true,
      url: true,
      uuid: true,
      datetime: true,
      datetimeAllowOffset: true,
      datetimePrecision: 2,
      customTest: true,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a number field', () => {
    const description = getFieldDescriptionFromName(
      'age',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'number',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: 30,
      min: 18,
      max: 65,
      integer: true,
      customTest: true,
      precision: 2,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a number with exclusive ranges', () => {
    const description = getFieldDescriptionFromName(
      'ageExclusive',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'number',
      required: false,
      nullable: true,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      lessThan: 70,
      moreThan: 10,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a date field', () => {
    const description = getFieldDescriptionFromName(
      'birthdate',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'date',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      min: new Date('2000-01-01'),
      max: new Date('2020-12-31'),
      customTest: true,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for an array field', () => {
    const description = getFieldDescriptionFromName(
      'tags',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'array',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      min: 1,
      max: 5,
      length: 2,
      customTest: true,
      of: {
        type: 'array',
        required: true,
        nullable: false,
        oneOf: [],
        notOneOf: [],
        default: undefined,
        description: expect.any(Object),
        tests: expect.any(Array),
        of: {
          type: 'string',
          required: true,
          nullable: false,
          oneOf: [],
          notOneOf: [],
          default: undefined,
          description: expect.any(Object),
          tests: expect.any(Array),
        },
      },
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a boolean field', () => {
    const description = getFieldDescriptionFromName(
      'confirmed',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

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

  it('returns the correct field properties for a oneOf field', () => {
    const description = getFieldDescriptionFromName(
      'oneOf',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: ['one', 'two', 'three'],
      notOneOf: [],
      default: undefined,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a notOneOf field', () => {
    const description = getFieldDescriptionFromName(
      'notOneOf',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: ['four', 'five', 'six'],
      default: undefined,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a nested field', () => {
    const description = getFieldDescriptionFromName(
      'nested.nestedString',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    expect(result).toStrictEqual({
      type: 'string',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a conditional field', () => {
    const description = getFieldDescriptionFromName(
      'conditional',
      schema.describe({ value: defaultValues }),
    )
    const result = getPropsFromFieldDescription(description)

    const toEqual = {
      type: 'string',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      description: expect.any(Object),
      tests: expect.any(Array),
    }

    expect(result).toStrictEqual(toEqual)

    const description2 = getFieldDescriptionFromName(
      'conditional',
      schema.describe({
        value: { ...defaultValues, nested: { nestedString: 'foo' } },
      }),
    )
    const result2 = getPropsFromFieldDescription(description2)

    expect(result2).toStrictEqual({
      ...toEqual,
      required: true,
    })
  })

  it('returns empty object if field description is null', () => {
    const result = getPropsFromFieldDescription(null)

    expect(result).toStrictEqual({})
  })

  it('gets props from field path and schema description', () => {
    const result = getPropsFromFieldPathAndSchemaDescription(
      'nested.fields.nestedString',
      schema.describe({ value: defaultValues }),
    )

    expect(result).toStrictEqual({
      type: 'string',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('gets props from field name and schema description', () => {
    const result = getPropsFromFieldNameAndSchemaDescription(
      'nested.nestedString',
      schema.describe({ value: defaultValues }),
    )

    expect(result).toStrictEqual({
      type: 'string',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })
})
