module.exports = {
  scripts: {
    bundle: "rollup -c rollup.config.js",
    build: {
      default: "nps transpile bundle build.test",
      test: "tsc -b tsconfig-test.json"
    },
    clean: "rm -rf ./dist",
    dev: "tsc -b -w",
    transpile: "tsc -b",
    test: "mocha dist/**/*.spec.js"
  }
};
