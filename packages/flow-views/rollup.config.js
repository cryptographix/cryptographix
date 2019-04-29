import config from "../rollup-config-build";
import pkg from "./package.json";

export default config(pkg, {
  input: "./src/index.ts",
  tsconfigOverride: {
    compilerOptions: {
      declaration: false,
      composite: false,
      declarationMap: undefined
    }
  }
});
