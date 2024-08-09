export default {
  roots: ['<rootDir>/src'],
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    //'^.+\\.tsx?$': 'ts-jest',
    '^.+\\.[jt]sx?$': 'babel-jest', // Add support for JSX
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [], // Add setup for React testing library
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 89,
      lines: 100,
      statements: 95,
    },
  },
}
