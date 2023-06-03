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
      'test/common-test/errors/test-errors.ts',
    ],

    tests: [
      'test/test-launchers/init-tests.spec.ts',

      // 'test/unit/**/*.spec.ts',
      // 'test/unit/**/insert-mode.spec.ts',
      // 'test/unit/modules/cursor-utils.spec.ts',
      // 'test/unit-cucumber/step-definitions/modes/abstract/folding.spec.ts',
    ],

    testFramework: 'jest',
    env: {
      type: 'node',
    },
    debug: true,
  };
};
