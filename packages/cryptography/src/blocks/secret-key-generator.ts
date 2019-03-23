import { Block, BlockSettings, block } from '@cryptographix/core';

export class SecretKeyGeneratorSettings extends BlockSettings {
}

@block( {
  name: 'secret-key-generator',
  namespace: 'org.cryptographix.cryptography',
  title: 'Secret Key Generator',
  category: 'Digital Cryptography',
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
