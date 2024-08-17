import { object, ref, string } from 'yup'
import {
  getFieldDescription,
  getFieldDescriptionFromPaths,
  getFieldPathsFromName,
} from './getFieldDescription'

describe('getFieldDescription', () => {
  describe('getFieldPathsFromName', () => {
    it('should split a simple name correctly', () => {
      const name = 'address'
      const result = getFieldPathsFromName(name)
      expect(result).toEqual({ valuePath: 'address', parentPath: '' })
    })

    it('should split a nested name correctly', () => {
      const name = 'user.address.street'
      const result = getFieldPathsFromName(name)
      expect(result).toEqual({
        valuePath: 'street',
        parentPath: 'user.address',
      })
    })

    it('should handle a single part name correctly', () => {
      const name = 'username'
      const result = getFieldPathsFromName(name)
      expect(result).toEqual({ valuePath: 'username', parentPath: '' })
    })
  })

  describe('getFieldDescription', () => {
    const schema = object({
      address: object({
        street: string().max(ref('$maxStreetLength')),
        city: string().notOneOf([ref('street')]),
      }),
    })

    it('should return the correct description for a simple schema', () => {
      const name = 'address.street'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const result = getFieldDescription({ name, schema, values })
      expect(result).toEqual(
        (schema.describe({ value: values }).fields.address as any).fields
          .street,
      )
    })

    it('should return the correct description for a nested schema', () => {
      const name = 'address.city'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const result = getFieldDescription({ name, schema, values })
      expect(result).toEqual(
        (schema.describe({ value: values }).fields.address as any).fields.city,
      )
    })

    it('should handle context correctly', () => {
      const name = 'address.street'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const context = { maxStreetLength: 10 }
      const result = getFieldDescription({ name, schema, values, context })
      expect(result).toEqual(
        (schema.describe({ value: values, context }).fields.address as any)
          .fields.street,
      )
    })

    it('should handle refs correctly', () => {
      const name = 'address.city'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const result = getFieldDescription({ name, schema, values })
      expect(result).toEqual(
        (schema.describe({ value: values }).fields.address as any).fields.city,
      )
    })

    it('should return null if the field is not found', () => {
      const name = 'address.zipCode'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const result = getFieldDescription({ name, schema, values })
      expect(result).toBeNull()
    })

    it('should throw an error if the field is not found', () => {
      const name = 'address.zipCode'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      expect(() =>
        getFieldDescription({ name, schema, values, throwError: true }),
      ).toThrow()
    })
  })

  describe('getFieldDescriptionFromPaths', () => {
    const schema = object({
      address: object({
        street: string(),
        city: string(),
      }),
    })

    it('should return the correct description for a simple schema', () => {
      const valuePath = 'street'
      const parentPath = 'address'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const result = getFieldDescriptionFromPaths({
        valuePath,
        parentPath,
        schema,
        values,
      })
      expect(result).toEqual(
        (schema.describe({ value: values }).fields.address as any).fields
          .street,
      )
    })

    it('should return the correct description for a nested schema', () => {
      const valuePath = 'city'
      const parentPath = 'address'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const result = getFieldDescriptionFromPaths({
        valuePath,
        parentPath,
        schema,
        values,
      })
      expect(result).toEqual(
        (schema.describe({ value: values }).fields.address as any).fields.city,
      )
    })

    it('should handle context correctly', () => {
      const valuePath = 'street'
      const parentPath = 'address'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const context = { someContext: true }
      const result = getFieldDescriptionFromPaths({
        valuePath,
        parentPath,
        schema,
        values,
        context,
      })
      expect(result).toEqual(
        (schema.describe({ value: values, context }).fields.address as any)
          .fields.street,
      )
    })

    it('should return null if the field is not found', () => {
      const valuePath = 'street'
      const parentPath = 'addressNotFound'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      const result = getFieldDescriptionFromPaths({
        valuePath,
        parentPath,
        schema,
        values,
      })
      expect(result).toBeNull()
    })

    it('should throw an error if the field is not found', () => {
      const valuePath = 'street'
      const parentPath = 'addressNotFound'
      const values = { address: { street: '123 Main St', city: 'Anytown' } }
      expect(() =>
        getFieldDescriptionFromPaths({
          valuePath,
          parentPath,
          schema,
          values,
          throwError: true,
        }),
      ).toThrow()
    })
  })
})
