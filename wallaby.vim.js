module.exports = function (wallaby) {
  return {
    files: [
      // {
      //   pattern: 'src/**/*.+(ts|html|json)',
      //   load: false,
      // },
      'src/**/*.+(ts|html|json)',
      'test/**/*.feature',
      'test/unit-cucumber/init-cucumber-testing.spec.ts',
      'test/unit-cucumber/step-definitions/**/*.ts',
    ],

    tests: [
      'test/test-launchers/init-tests.spec.ts',
      // 'test/unit-cucumber/index.spec.ts'
    ],

    testFramework: 'jest',
    env: {
      type: 'node',
    },
    debug: true,
  };
};