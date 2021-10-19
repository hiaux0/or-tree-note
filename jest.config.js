module.exports = {
  roots: ['<rootDir>'],
  // modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t|j]s$': '@sucrase/jest-plugin',
    // '^.+\\.ts$': '@swc/jest',
    // '^.+\\.ts$': 'esbuild-jest',
  },
  // preset: 'ts-jest',
  // verbose: true,
  testRegex: '.[j,t]s$',
  // coverageDirectory: '.coverage',
  // coverageReporters: ['text', 'text-summary'],
  // coverageThreshold: {
  //   global: { statements: 90, lines: 90, functions: 90 },
  // },
  moduleNameMapper: {
    "common/(.*)": "<rootDir>/src/common/$1",
    "modules/(.*)": "<rootDir>/src/modules/$1",
    "resources/(.*)": "<rootDir>/src/resources/$1"
  },
  testPathIgnorePatterns: ['/build/', '/node_modules/', '/testFixture/'],
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tests/tsconfig.json',
  //   },
  // },
};
