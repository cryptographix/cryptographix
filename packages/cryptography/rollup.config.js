import config from "../rollup-config-build";
import pkg from "./package.json";

let localConfig = {
  input: "./src/index.ts",

  external: [
    //"forge",
    //"jsbn",
    "crypto",
    "node-forge",
    "@cryptographix/core"
  ],
  globals: {
    crypto: "crypto",
    "node-forge": "forge",
    "@cryptographix/core": "cryptographix.core"
  }
};

export default config(pkg, localConfig);
