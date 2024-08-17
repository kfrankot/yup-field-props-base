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
