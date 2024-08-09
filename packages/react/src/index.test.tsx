// TODO: need to fill oneOf and notOneOf cases, add more explicit types for NumberFieldProps, etc... and consider
// adjustment value setting to not have FieldProps attributes falling back as undefined, unless appropriate (such as for "default")

import React, { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { object, string, number, boolean, date, mixed, array } from 'yup'
import { useYupFieldProps, YupSchemaProvider } from '.'

describe('useYupFieldProps', () => {
  const schema = object({
    name: string()
      .required()
      .min(3)
      .max(50)
      .matches(/^[a-zA-Z]+$/, { excludeEmptyString: true })
      .email()
      .url()
      .uuid()
      .datetime({ allowOffset: true, precision: 2 }),
    age: number().required().min(18).max(65).integer().default(30),
    ageExclusive: number().nullable().lessThan(70).moreThan(10),
    birthdate: date()
      .required()
      .min(new Date('2000-01-01'))
      .max(new Date('2020-12-31')),
    tags: array().of(string().required()).min(1).max(5),
  })

  const values = {
    name: 'John',
    age: 30,
    birthdate: new Date('2000-05-15'),
    tags: ['tag1', 'tag2'],
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <YupSchemaProvider schema={schema} values={values}>
      {children}
    </YupSchemaProvider>
  )

  it('returns the correct field properties for a string field', () => {
    const { result } = renderHook(() => useYupFieldProps('name'), { wrapper })

    expect(result.current).toStrictEqual({
      type: 'string',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      min: 3,
      max: 50,
      matches: /^[a-zA-Z]+$/,
      email: true,
      url: true,
      uuid: true,
      datetime: true,
      datetimeAllowOffset: true,
      datetimePrecision: 2,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a number field', () => {
    const { result } = renderHook(() => useYupFieldProps('age'), { wrapper })

    expect(result.current).toStrictEqual({
      type: 'number',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: 30,
      min: 18,
      max: 65,
      integer: true,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a number field part 2', () => {
    const { result } = renderHook(() => useYupFieldProps('ageExclusive'), {
      wrapper,
    })

    console.log(JSON.stringify(result.current, null, 2))

    expect(result.current).toStrictEqual({
      type: 'number',
      required: false,
      nullable: true,
      oneOf: [],
      notOneOf: [],
      moreThan: 10,
      lessThan: 70,
      default: undefined,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for a date field', () => {
    const { result } = renderHook(() => useYupFieldProps('birthdate'), {
      wrapper,
    })

    expect(result.current).toStrictEqual({
      type: 'date',
      required: true,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      min: new Date('2000-01-01'),
      max: new Date('2020-12-31'),
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })

  it('returns the correct field properties for an array field', () => {
    const { result } = renderHook(() => useYupFieldProps('tags'), { wrapper })

    expect(result.current).toStrictEqual({
      type: 'array',
      required: false,
      nullable: false,
      oneOf: [],
      notOneOf: [],
      default: undefined,
      min: 1,
      max: 5,
      description: expect.any(Object),
      tests: expect.any(Array),
    })
  })
})
