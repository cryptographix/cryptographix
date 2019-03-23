import { Encoder, BlockSettings, InvalidInputError, block } from '@cryptographix/core';
import { booleanProp, /*numberField, stringField,*/ enumProp, bytesProp } from '@cryptographix/core';
import { BlockCipher, BlockCipherHelper } from '../primitives/block-cipher';
import { IBytesSchemaProp } from '@cryptographix/core';


const paddingAvailable = BlockCipherHelper.isPaddingAvailable();
//const defaultAlgorithm = BlockCipherHelper.getAlgorithms()[0];
const algorithmNameMap = BlockCipherHelper.getAlgorithms()
  .reduce( (obj,el)=>{
    obj[el.name] = el.label; return obj;
  }, {} );

const modeNameMap = BlockCipherHelper.getModes()
  .reduce( (obj,el)=>{
    obj[el.name] = el.label; return obj;
  }, {} );

export class SecretKeyEncrypterSettings extends BlockSettings {
  @enumProp({
    viewWidth: paddingAvailable ? 8 : 12,
    options: algorithmNameMap,
  })
  algorithm: string = BlockCipherHelper.getAlgorithms()[0].name;

  @booleanProp( {
    trueLabel: "Encrypt",
    falseLabel: "Decrypt"
  } )
  encrypt: boolean = true;

  @booleanProp({
    optional: true,
    ignore: !paddingAvailable,
    viewWidth: paddingAvailable ? 4 : 12
  })
  padding?: boolean;

  @enumProp({
    optional: true,
    options: modeNameMap,
  })
  mode?: string = BlockCipherHelper.getModes()[0].name;

  @bytesProp()
  key: Uint8Array;

  @bytesProp( { optional: true } )
  iv?: Uint8Array;
}

/**
 * Encoder for secret-key cipher encryption and decryption
 */
@block( {
  name: 'secret-key-encrypter',
  namespace: 'org.cryptographix.cryptography',
  title: 'Secret Key Encrypter',
  category: 'Digital Cryptography',
  settings: SecretKeyEncrypterSettings
} )
export class SecretKeyEncrypter extends Encoder<SecretKeyEncrypterSettings> {

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
  async transform( content: Uint8Array, isEncode: boolean ): Promise<Uint8Array> {
    const message = content;
    const { algorithm, encrypt, mode, key, padding, iv } = this.settings;

    try {
      // Try to encrypt or decrypt
      return await BlockCipher.createCipher(
        algorithm,
        mode,
        key,
        iv,
        padding,
        encrypt ? isEncode : !isEncode,
        message
      );

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
