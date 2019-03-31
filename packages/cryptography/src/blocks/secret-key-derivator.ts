import { Block, block } from "@cryptographix/core";

export class SecretKeyDerivatorSettings {}

@block({
  name: "secret-key-derivator",
  namespace: "org.cryptographix.cryptography",
  title: "Secret Key Derivator",
  category: "Digital Cryptography",
  settings: SecretKeyDerivatorSettings
})
export class SecretKeyDerivator extends Block<SecretKeyDerivatorSettings> {
  /**
   * Constructor
   */
  constructor() {
    super();
  }
}
