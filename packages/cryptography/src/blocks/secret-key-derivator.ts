import { Block, BlockSettings, block } from "@cryptographix/core";

export class SecretKeyDerivatorSettings extends BlockSettings {}

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
