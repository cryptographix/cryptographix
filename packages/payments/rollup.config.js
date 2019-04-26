import config from "../rollup-config-build";
import pkg from "./package.json";

let localConfig = {
  input: "./src/index.ts",
  external: ["node-forge", "crypto"],
  globals: {
    "node-forge": "forge",
    "@cryptographix/core": "cryptographix.core",
    "@cryptographix/cryptography": "cryptographix.cryptography"
  }
};

export default config(pkg, localConfig);
