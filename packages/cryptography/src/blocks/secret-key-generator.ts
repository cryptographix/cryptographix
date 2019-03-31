import { Block, block } from "@cryptographix/core";

export class SecretKeyGeneratorSettings {}

@block({
  name: "secret-key-generator",
  namespace: "org.cryptographix.cryptography",
  title: "Secret Key Generator",
  category: "Digital Cryptography",
  settings: SecretKeyGeneratorSettings
})
export class SecretKeyGenerator extends Block<SecretKeyGeneratorSettings> {
  /**
   * Constructor
   */
  constructor() {
    super();
  }
}
