import {
  getFieldDescriptionPathFromName,
  getFieldDescriptionFromPath,
  getFieldDescriptionFromName,
} from './getFieldDescription'
import { object, string } from 'yup'

const getDescription = () =>
  object({
    address: object({
      street: string(),
      city: string(),
    }),
  }).describe()

describe('getFieldDescription', () => {
  describe('getFieldDescriptionPathFromName', () => {
    it('should transform name to path correctly', () => {
      const name = 'user.address.street'
      const expectedPath = 'user.fields.address.fields.street'
      const result = getFieldDescriptionPathFromName(name)
      expect(result).toBe(expectedPath)
    })
  })

  describe('getFieldDescriptionFromPath', () => {
    it('should return the correct field description from path', () => {
      const path = 'address.fields.street'
      const description = getDescription()
      const result = getFieldDescriptionFromPath(path, description)
      expect(result).toEqual((description.fields.address as any).fields.street)
    })

    it('should return null if the path does not exist', () => {
      const path = 'address.fields.zipcode'
      const description = getDescription()
      const result = getFieldDescriptionFromPath(path, description)
      expect(result).toBeNull()
    })
  })

  describe('getFieldDescriptionFromName', () => {
    it('should return the correct field description from name', () => {
      const name = 'address.street'
      const description = getDescription()
      const result = getFieldDescriptionFromName(name, description)
      expect(result).toEqual((description.fields.address as any).fields.street)
    })

    it('should return null if the name does not exist', () => {
      const name = 'address.zipcode'
      const description = getDescription()
      const result = getFieldDescriptionFromName(name, description)
      expect(result).toBeNull()
    })
  })
})
