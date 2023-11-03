export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  globalTeardown: './test/testTeardownGlobals.js',
};