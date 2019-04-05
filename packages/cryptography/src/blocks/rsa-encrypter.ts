import { ByteArray } from "@cryptographix/core";
import { IRSAKey } from "../primitives/keys";

import "../provider/node-forge";
import { forge } from "../provider/node-forge";

import {
  Transformer,
  block,
  bytesProp,
  objectProp,
  isPort
} from "@cryptographix/core";

export class RSAEncrypterSettings {}

@block({
  name: "rsa-encrypter",
  namespace: "org.cryptographix.cryptography",
  title: "RSA Encrypter",
  category: "Modern cryptography",
  config: RSAEncrypterSettings
})
export class RSAEncrypter extends Transformer<RSAEncrypterSettings> {
  @bytesProp()
  @isPort({ type: "data-in", primary: true })
  plain: ByteArray;

  @objectProp(RSAEncrypterSettings, {})
  @isPort({ type: "data-in" })
  key: IRSAKey;

  @bytesProp()
  @isPort({ type: "data-out" })
  crypto: ByteArray;

  constructor() {
    super();
  }

  async process() {
    let key = {
      e: new forge.jsbn.BigInteger(
        ByteArray.toString(this.key.data.e, "hex"),
        16
      ),
      n: new forge.jsbn.BigInteger(
        ByteArray.toString(this.key.data.n, "hex"),
        16
      )
    };

    let result: string;

    result = forge.pki.rsa.decrypt(
      ByteArray.toString(this.crypto),
      key,
      true,
      false
    );

    this.plain = ByteArray.fromString(result);

    return Promise.resolve(true);
  }

  async trigger() {
    this.process();
  }
}
