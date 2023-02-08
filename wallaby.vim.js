module.exports = function (wallaby) {
  return {
    files: [
      // {
      //   pattern: 'src/**/*.+(ts|html|json)',
      //   load: false,
      // },
      'src/**/*.+(ts|html|json)',

      'test/**/*.feature',
      'test/common-test/**/*.ts',
      'test/unit-cucumber/init-cucumber-testing.spec.ts',

      // 'test/unit-cucumber/step-definitions/**/*.ts',
    ],

    tests: [
      // 'test/test-launchers/init-tests.spec.ts',
      // 'test/unit-cucumber/step-definitions/letter-e.spec.ts',
      'test/unit-cucumber/step-definitions/vim-input.spec.ts',
    ],

    testFramework: 'jest',
    env: {
      type: 'node',
    },
    debug: true,
  };
};
