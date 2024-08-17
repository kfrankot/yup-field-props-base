export default {
  roots: ['<rootDir>/src'],
  verbose: true,
  transform: {
    '^.+\\.[jt]s$': 'babel-jest', // Add support for JSX
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 100,
      lines: 95,
      statements: 90,
    },
  },
}
