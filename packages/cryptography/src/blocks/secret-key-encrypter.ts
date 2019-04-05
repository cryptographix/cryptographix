import {
  Action,
  Transformer,
  InvalidInputError,
  block
} from "@cryptographix/core";
import {
  booleanProp,
  isPort,
  /*numberField, stringField,*/ enumProp,
  bytesProp
} from "@cryptographix/core";
import { BlockCipher, BlockCipherHelper } from "../primitives/block-cipher";
import { IBytesSchemaProp } from "@cryptographix/core";
import {
  BlockPropertyChanged,
  ConfigPropertyChanged
} from "@cryptographix/core";

const paddingAvailable = BlockCipherHelper.isPaddingAvailable();

/**
 * Map algorithm name: label pairs onto an object
 */
const algorithmNameMap = BlockCipherHelper.getAlgorithms().reduce((obj, el) => {
  obj[el.name] = el.label;
  return obj;
}, {});

/**
 * Map mode name: label pairs onto an object
 */
const modeNameMap = BlockCipherHelper.getModes().reduce((obj, el) => {
  obj[el.name] = el.label;
  return obj;
}, {});

/**
 * Settings
 */
export class SecretKeyEncrypterSettings {
  @enumProp({
    title: "Algorithm Name",
    ui: { columns: paddingAvailable ? 8 : 12, hint: "Crypto Algorithm" },
    options: algorithmNameMap
  })
  algorithm: string = BlockCipherHelper.getAlgorithms()[0].name;

  @booleanProp({
    title: "Direction",
    trueLabel: "Encrypt",
    falseLabel: "Decrypt"
  })
  encrypt: boolean = true;

  @booleanProp({
    title: "Pad using PKCS#7",
    optional: true,
    ignore: !paddingAvailable,
    ui: { columns: paddingAvailable ? 8 : 12 }
  })
  padding?: boolean;

  @enumProp({
    optional: true,
    options: modeNameMap
    //ui: { widget: "radio" }
  })
  mode?: string = BlockCipherHelper.getModes()[0].name;

  @bytesProp()
  key: Uint8Array;

  @bytesProp({
    optional: true,
    ui: { hint: "Size must be equal to cipher block size" }
  })
  iv?: Uint8Array;
}

/**
 * Encoder for secret-key cipher encryption and decryption
 */
@block({
  name: "secret-key-encrypter",
  namespace: "org.cryptographix.cryptography",
  title: "Secret Key Encrypter",
  category: "Digital Cryptography",
  config: SecretKeyEncrypterSettings
})
export class SecretKeyEncrypter extends Transformer<
  SecretKeyEncrypterSettings
> {
  _blockCipher: BlockCipher;

  @bytesProp({ ui: { widget: "multiline" } })
  @isPort({ type: "data-in" })
  "in"?: Uint8Array;

  @bytesProp({ ui: { widget: "multiline" } })
  @isPort({ type: "data-out" })
  out?: Uint8Array;

  /**
   * Action handler
   * - handles config changes
   */
  handleAction(action: Action): Action {
    let act = action as BlockPropertyChanged | ConfigPropertyChanged;

    switch (act.action) {
      case "config:property-changed": {
        this.configChanged(act.key, act.value);
        break;
      }
    }

    return super.handleAction(action);
  }

  /**
   * Triggered when a config field has changed.
   */
  configChanged(setting: string, value: string) {
    let helper = this.helper;

    switch (setting) {
      case "algorithm": {
        const { keySize } = BlockCipherHelper.getAlgorithm(value);

        let key = helper.getConfigSchema<IBytesSchemaProp>(this.config, "key");
        key.minSize = keySize;
        key.maxSize = keySize;
        break;
      }

      case "mode": {
        const { algorithm } = this.config;
        const { blockSize } = BlockCipherHelper.getAlgorithm(algorithm);
        const { hasIV } = BlockCipherHelper.getMode(value);

        let iv = helper.getConfigSchema<IBytesSchemaProp>(this.config, "iv");
        iv.minSize = blockSize;
        iv.ignore = !hasIV;
        break;
      }
    }
  }

  /**
   * Performs encode or decode on given content.
   */
  async trigger(reverse: boolean) {
    const message = this.in;
    const { algorithm, encrypt, mode, key, padding, iv } = this.config;

    try {
      // Try to encrypt or decrypt
      this.out = await BlockCipher.createCipher(
        algorithm,
        mode,
        key,
        iv,
        padding,
        reverse ? !encrypt : encrypt,
        message
      );
    } catch (err) {
      // Catch invalid input errors
      if (!encrypt) {
        throw new InvalidInputError(
          `${algorithm} decryption failed, ` +
            `this may be due to malformed content`
        );
      } else {
        throw new InvalidInputError(`${algorithm} encryption failed`);
      }
    }
  }
}
