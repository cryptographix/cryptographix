import { Transformer, block } from "@cryptographix/core";

export class SecretKeyGeneratorSettings {}

@block({
  name: "secret-key-generator",
  namespace: "org.cryptographix.cryptography",
  title: "Secret Key Generator",
  category: "Digital Cryptography",
  config: SecretKeyGeneratorSettings
})
export class SecretKeyGenerator extends Transformer<
  SecretKeyGeneratorSettings
> {
  /**
   * Constructor
   */
  constructor() {
    super();
  }

  async trigger() {}
}
