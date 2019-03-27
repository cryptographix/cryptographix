import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
//import typescript from 'rollup-plugin-typescript';

function name(s) {
  return s.slice(1 + s.indexOf("/"));
}

let packages = require("../../lerna.json").packages || [];
//console.log( packages );

packages = packages.map(n => name(n));
console.log( packages );

export default function(pkg, local = {}) {
  let me = name(pkg.name);

  let globals = {
    ...packages.reduce((a, v) => {
      a["@cryptographix/" + v] = "cryptographix." + v;
      return a;
    }, {}),
    tslib: me != "core" ? "tslib" : undefined,
    ...local.globals
  };

  let external = [
    ...packages.map( n=> '@cryptographix/'+n ),
    ...(local.external || [])
  ];
  if (me != "core") external.push("tslib");

  return [
    // browser-friendly UMD build
    {
      input: "./dist/build/index.js",
      output: {
        name: "cryptographix." + name(pkg.name),
        file: pkg.browser,
        format: "umd",
        //exports: 'named',
        globals: globals,
        sourcemap: true
      },
      plugins: [
        //typescript(),
        resolve({
          main: true,
          modules: true,
        }),
        commonjs(),
        ...(local.plugins||[]),
      ],
      external: external
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
      input: "./dist/build/index.js",
      //      input: 'src/index.ts',
      output: [
        {
          file: pkg.main,
          format: "cjs",
          sourcemap: true
        },
        {
          file: pkg.module,
          format: "es",
          sourcemap: true
        }
      ],
      plugins: [
        resolve()
        //typescript(),
      ],
      external: external
    }
  ];
}
