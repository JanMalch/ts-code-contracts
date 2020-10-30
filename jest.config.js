/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: 'index\\.test\\.ts',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 79, // bug: branch not covered on super call (https://stackoverflow.com/q/52820169)
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
