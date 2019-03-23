import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
//import typescript from 'rollup-plugin-typescript';
let packages = require( '../../lerna.json' ).packages || [];
//console.log( packages );

packages = packages.map( (n)=> n.slice(1+n.indexOf('/')) );

export default function ( pkg, local = {} ) {
  let globals = {
    ...packages.reduce( (a,v) => { a['@cryptographix/'+v] = v; return a }, {} ),
    'tslib': 'tslib',
    ...local.globals
  };

  let external = [
    ...packages.map( n=> '@cryptographix/'+n ),
    'tslib',
    ...local.external ||[]
  ];

  return [
    // browser-friendly UMD build
    {
      input: './dist/build/index.js',
      output: {
        name: pkg.name,
        file: pkg.browser,
        format: 'umd',
        //exports: 'named',
        globals: globals,
        sourcemap: true
      },
      plugins: [
        //typescript(),
        //resolve(),
        commonjs(),
      ],
      external: external,
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
      input: './dist/build/index.js',
      //      input: 'src/index.ts',
      output: [ {
          file: pkg.main,
          format: 'cjs',
          sourcemap: true
        },
        {
          file: pkg.module,
          format: 'es',
          sourcemap: true
        }
      ],
      plugins: [
        //typescript(),
      ],
      external: external,
    }
  ];
}
