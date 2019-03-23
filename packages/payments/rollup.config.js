import config from '../rollup-config-build';
import pkg from './package.json';

let localConfig = {
  external: [
    'forge','jsbn','crypto'
  ],
  globals: {
    'crypto': 'crypto'
  },
}

export default config( pkg, localConfig );
