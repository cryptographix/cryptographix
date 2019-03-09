//import { BlockSettings } from '@cryptographix/core';

/*export class Browser {
  static isNode() { return true };
}*/

interface XCrypto extends Crypto {
  webkitSubtle: SubtleCrypto;
}

export interface XWindow extends Window {
  msCrypto: XCrypto;
  crypto: XCrypto;
}






//import { * as Reflect } from "reflect-metadata";
