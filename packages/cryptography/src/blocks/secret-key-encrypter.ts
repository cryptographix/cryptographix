import {
  Action,
  Transformer,
  InvalidInputError,
  ByteArray,
  block
} from "@cryptographix/core";
import { booleanProp, isPort, enumProp, bytesProp } from "@cryptographix/core";
import { IBytesSchemaProp } from "@cryptographix/core";
import {
  BlockPropertyChanged,
  ConfigPropertyChanged
} from "@cryptographix/core";

import { BlockCipher, BlockCipherHelper } from "../primitives/block-cipher";

/**
 *
 */
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
export class SecretKeyEncrypterConfig {
  @enumProp({
    title: "Algorithm Name",
    ui: { columns: paddingAvailable ? 8 : 12, hint: "Crypto Algorithm" },
    options: algorithmNameMap
  })
  algorithm: string = BlockCipherHelper.getAlgorithms()[0].name;

  @booleanProp({
    title: "Direction",
    trueLabel: "Encrypt",
    falseLabel: "Decrypt",
    ui: { widget: "radio" }
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
    title: "Block Mode",
    optional: true,
    options: modeNameMap
    //ui: { widget: "radio" }
  })
  mode?: string = BlockCipherHelper.getModes()[0].name;

  @bytesProp({
    title: "Initial Vector",
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
  markdown: {
    prompt:
      "Use the SecretKeyEncrypter Block to encrypt or decrypt data using modern block-ciphers such as AES",
    about: ""
  },
  config: SecretKeyEncrypterConfig
})
export class SecretKeyEncrypter extends Transformer<SecretKeyEncrypterConfig> {
  @bytesProp({
    title: "Data to Encrypt/Decrypt",
    ui: { widget: "multiline" }
  })
  @isPort({ type: "data-in", primary: true })
  "in"?: Uint8Array;

  @bytesProp({ title: "Secret Key", minLength: 8, maxLength: 32 })
  @isPort({ type: "data-in" })
  key: Uint8Array;

  @bytesProp({
    title: "Initial Vector",
    optional: true,
    ui: { hint: "Size must be equal to cipher block size" }
  })
  @isPort({ type: "data-in" })
  iv?: Uint8Array;

  @bytesProp({
    title: "Encrypted / Decrypted Data",
    ui: { widget: "multiline" }
  })
  @isPort({ type: "data-out", primary: true })
  out?: Uint8Array;

  /**
   * Action handler
   * - handles config changes
   */
  handleAction(action: Action): Promise<Action> {
    let act = action as BlockPropertyChanged | ConfigPropertyChanged;

    switch (act.action) {
      case "config:property-changed": {
        this.configChanged(act.key, act.value);
        break;
      }
    }

    return null;
  }

  /**
   * Triggered when a config field has changed.
   */
  configChanged(setting: string, value: string) {
    let helper = this.helper;

    switch (setting) {
      case "algorithm": {
        const { keySize } = BlockCipherHelper.getAlgorithm(value);
        const { blockSize } = BlockCipherHelper.getAlgorithm(value);

        helper.updateSchemaProp<IBytesSchemaProp>("key", {
          minLength: keySize,
          maxLength: keySize
        });

        helper.updateSchemaProp<IBytesSchemaProp>("iv", {
          minLength: blockSize,
          maxLength: blockSize
        });

        break;
      }

      case "mode": {
        const { hasIV } = BlockCipherHelper.getMode(value);

        helper.updateSchemaProp<IBytesSchemaProp>("iv", {
          ignore: !hasIV
        });
        break;
      }
    }
  }

  /**
   * Performs encode or decode on given content.
   */
  async trigger(reverse: boolean) {
    const { in: message, iv } = this;
    const { algorithm, encrypt, mode, padding } = this.config;

    try {
      // Try to encrypt or decrypt
      this.out = await BlockCipher.createCipher(
        algorithm,
        mode,
        this.key,
        iv || ByteArray.alloc(this.key.length),
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
