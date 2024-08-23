import { Get } from 'type-fest'

type NestedKey<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends string
          ? `${K}` | `${K}.${NestedKey<T[K]>}`
          : never
      }[keyof T]
    : never

export const throwOrReturn = <T>(
  error: unknown,
  throwError: boolean,
  defaultValue: T,
) => {
  if (throwError) {
    throw error
  }
  console.warn(error)
  return defaultValue
}

export const get = <
  TObject extends Record<string, unknown>,
  TPath extends NestedKey<TObject>,
>(
  object: TObject | undefined,
  path: TPath,
) => {
  const parts = path.toString().split('.')
  let iterateObject: any = object
  for (let part of parts) {
    if (!iterateObject) return undefined
    iterateObject = iterateObject[part]
  }
  return iterateObject as Get<TObject, TPath>
}
