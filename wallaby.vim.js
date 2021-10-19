module.exports = function (wallaby) {
  return {
    files: [
      {
        pattern: 'src/**/*.+(ts|html|json)',
        load: false
      },    ],

    tests: [
      'tests/testLauncher/withWallaby.spec.ts',
      // 'tests/unit/step-definitions/embeddedLanguages/embedded-support.spec.ts',
    ],

    testFramework: 'jest',
    env: {
      type: 'node',
    },
    debug: true,
  };
};
