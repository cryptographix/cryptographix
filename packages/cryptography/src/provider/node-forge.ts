import * as forge from "node-forge";

declare module  "node-forge" {
  namespace pki {
    namespace rsa {
      function encrypt(m: util.ByteStringBuffer|string, key: Key, bt: boolean | 0x01 | 0x02): Bytes;
      function decrypt(ed: util.ByteStringBuffer|string, key: Key, pub: boolean, ml?: number|boolean): Bytes;
    }
  }

  namespace jsbn {
    class BigInteger {
      constructor ( val: string, base: number);
    }
  }
}

export { forge };
export type Bytes = string;
