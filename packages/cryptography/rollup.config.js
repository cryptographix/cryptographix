import config from '../rollup-config-build';
import pkg from './package.json';

let localConfig = {
  external: [
    'forge','jsbn','crypto','tslib','node-forge','@cryptographix/core'
  ],
  globals: {
    'crypto': 'crypto',
    'tslib':'tslib',
    'node-forge':'forge',
    '@cryptographix/core': 'cryptographix.core'
  },
}

export default config( pkg, localConfig );
