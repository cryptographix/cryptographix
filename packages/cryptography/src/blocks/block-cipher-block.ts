import { Encoder as Transformer, InvalidInputError, block } from '@cryptographix/core';
import { BlockCipher, BlockCipherSettings } from '../primitives/block-cipher';
import { BlockCipherHelper } from '../primitives/block-cipher';
import { IBytesSchemaProp } from '@cryptographix/core';

/**
 * Encoder for block cipher encryption and decryption
 */
@block( {
  name: 'block-cipher',
  namespace: 'org.cryptographix.cryptography',
  title: 'Block Cipher',
  category: 'Modern cryptography',
  type: 'encoder',
  settings: BlockCipherSettings
} )
export class BlockCipherEncoder extends Transformer<BlockCipherSettings> {

  _settings: BlockCipherSettings;

  _blockCipher: BlockCipher;

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Triggered when a setting field has changed.
   */
  settingChanged( setting: string, value: string ): boolean {
    switch (setting) {
      case 'algorithm': {
        const { keySize } = BlockCipherHelper.getAlgorithm(value)

        let key = this.getSettingSchema<IBytesSchemaProp>( 'key' );
        key.minSize = keySize;
        key.maxSize = keySize;
        break
      }

      case 'mode': {
        const algorithm = this._settings.algorithm
        const { blockSize } = BlockCipherHelper.getAlgorithm(algorithm)
        const { hasIV } = BlockCipherHelper.getMode(value)

        let iv = this.getSettingSchema<IBytesSchemaProp>( 'iv' );
        iv.minSize = blockSize;
        iv.ignore = !hasIV;
        break
      }
    }

    return super.settingChanged(setting, value);
  }

  /**
   * Performs encode or decode on given content.
   */
  async performTranslate( content: Uint8Array, isEncode: boolean ): Promise<Uint8Array> {
    const message = content; //.getBytes()
    const { algorithm, mode, key, padding, iv } = this._settings;

    try {
      // Try to encrypt or decrypt
      return await BlockCipher.createCipher(
        algorithm, mode, key, iv, padding, isEncode, message)

    } catch (err) {
      // Catch invalid input errors
      if (!isEncode) {
        throw new InvalidInputError(
          `${algorithm} decryption failed, ` +
          `this may be due to malformed content`)
      } else {
        throw new InvalidInputError(`${algorithm} encryption failed`)
      }
    }
  }
}
