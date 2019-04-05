import { Transformer, block } from "@cryptographix/core";

export class SecretKeyDerivatorSettings {}

@block({
  name: "secret-key-derivator",
  namespace: "org.cryptographix.cryptography",
  title: "Secret Key Derivator",
  category: "Digital Cryptography",
  config: SecretKeyDerivatorSettings
})
export class SecretKeyDerivator extends Transformer<
  SecretKeyDerivatorSettings
> {
  /**
   * Constructor
   */
  constructor() {
    super();
  }

  async trigger() {}
}
