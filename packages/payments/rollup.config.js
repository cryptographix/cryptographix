import config from "../rollup-config-build";
import pkg from "./package.json";

let localConfig = {
  external: ["node-forge", "crypto"],
  globals: {
    "node-forge": "forge",
    "@cryptographix/core": "cryptographix.core",
    "@cryptographix/cryptography": "cryptographix.cryptography"
  }
};

export default config(pkg, localConfig);
