module.exports = {
  scripts: {
    "clean": "rm -rf ./dist",
    "lint": "npm run lint:src && npm run lint:test",
    "lint:src": "tslint --project tsconfig.json -t stylish",
    "lint:test": "tslint --project tsconfig-test.json --config ../tslint-test.json -e \"src/**/*.ts\" -t stylish",
    "transpile": "tsc -b",
    "bundle": "rollup -c rollup.config.js",
    "build": "nps transpile bundle build:test",
    "build:test": "tsc -b tsconfig-test.json",
    "test": "mocha dist/**/*.spec.js",
    "dev": "tsc -b -w",
    "publish:local": "npm pack"
  }
}
