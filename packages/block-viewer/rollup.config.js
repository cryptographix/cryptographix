import typescript from "rollup-plugin-typescript2";
import config from "../rollup-config-build";
import pkg from "./package.json";
const { join } = require("path");
const staticDir = join(__dirname, "../");
const cgx = "@cryptographix";

function myExample() {
  return {
    name: "my-example", // this name will show up in warnings and errors
    resolveId(importee) {
      console.log("Import: ", importee);

      if (0 && importee.startsWith(cgx)) {
        let imp = join(importee.replace(cgx, staticDir), "dist/build/index.js");
        console.log(imp);
        return imp;
      }
      return null; // other ids should be handled as usually
    },
    load(id) {
      console.log("Load: ", id);
      if (id === "virtual-module") {
        return 'export default "This is virtual!"'; // the source code for "virtual-module"
      }
      return null; // other ids should be handled as usually
    },
    generateBundle(options, bundle) {
      //      console.log("Generate");
      //      console.log(bundle);
      return null;
    },
    renderChunk(chunk) {
      //      console.log("Render");
      //      console.log(chunk);
      return null;
    }
  };
}

export default config(pkg, {
  input: "./src/index.ts",
  external: ["window"],
  plugins: [
    myExample(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
          composite: false,
          declarationMap: undefined
        }
      }
    })
  ]
});
