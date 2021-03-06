import { Environment } from "@cryptographix/core";
import { XWindow } from "./webcrypto-ie-shim";

import * as nodeCrypto from "crypto";
declare var window: XWindow;

export class BlockCipherHelper {
  /**
   * Returns whether padding is available in the current environment.
   */
  static isPaddingAvailable(): boolean {
    return Environment.isNode();
  }

  /**
   * Returns algorithm for given name.
   * @protected
   * @param {string} name Algorithm name
   * @return {?object} Algorithm object or null, if not found.
   */
  static algorithms = [
    {
      name: "des",
      label: "DES",
      blockSize: 8,
      keySize: 8,
      //browserAlgorithm: 'aes',
      nodeAlgorithm: "des"
    },
    {
      name: "des2",
      label: "TDES-2 Key",
      blockSize: 8,
      keySize: 16,
      //browserAlgorithm: 'aes',
      nodeAlgorithm: "des-ede"
    },
    {
      name: "des3",
      label: "TDES-3 Key",
      blockSize: 8,
      keySize: 24,
      //browserAlgorithm: 'aes',
      nodeAlgorithm: "des-ede3"
    },
    {
      name: "aes-128",
      label: "AES-128",
      blockSize: 16,
      keySize: 16,
      browserAlgorithm: "aes",
      nodeAlgorithm: "aes-128"
    },
    {
      name: "aes-192",
      label: "AES-192",
      blockSize: 16,
      keySize: 24,
      // Not widely supported in browsers
      //       browserAlgorithm: false,
      nodeAlgorithm: "aes-192"
    },
    {
      name: "aes-256",
      label: "AES-256",
      blockSize: 16,
      keySize: 32,
      browserAlgorithm: "aes",
      nodeAlgorithm: "aes-256"
    }
  ];

  static getAlgorithm(name: string) {
    return BlockCipherHelper.algorithms.find(
      algorithm => algorithm.name === name.toLowerCase()
    );
  }

  /**
   * Returns algorithm objects available in the current environment.
   */
  static getAlgorithms() {
    const isNode = Environment.isNode();
    return BlockCipherHelper.algorithms.filter(
      algorithm =>
        (algorithm.browserAlgorithm && !isNode) ||
        (algorithm.nodeAlgorithm && isNode)
    );
  }

  /**
   * Returns mode for given name.
   */
  static getMode(name: string) {
    return BlockCipherHelper.getModes().find(
      mode => mode.name === name.toLowerCase()
    );
  }

  /**
   * Returns mode objects available in the current environment.
   */
  static getModes() {
    const isNode = Environment.isNode();

    const modes = [
      {
        name: "ecb",
        label: "ECB (Electronic Code Book)",
        hasIV: false,
        browserMode: false,
        nodeMode: true
      },
      {
        name: "cbc",
        label: "CBC (Cipher Block Chaining)",
        hasIV: true,
        browserMode: true,
        nodeMode: true
      },
      {
        name: "ctr",
        label: "CTR (Counter)",
        hasIV: true,
        browserMode: true,
        nodeMode: true
      }
    ];

    return modes.filter(
      mode => (mode.browserMode && !isNode) || (mode.nodeMode && isNode)
    );
  }
}

export class BlockCipher {
  /**
   * Creates message cipher using given algorithm.
   */
  static async createCipher(
    name: string,
    mode: string,
    key: Uint8Array,
    iv: Uint8Array,
    padding: boolean,
    isEncode: boolean,
    message: Uint8Array
  ): Promise<Uint8Array> {
    const algorithm = BlockCipherHelper.getAlgorithm(name);

    const { hasIV } = BlockCipherHelper.getMode(mode);
    if (!hasIV) {
      iv = new Uint8Array([]);
    }

    if (Environment.isNode()) {
      const cipherName = algorithm.nodeAlgorithm + "-" + mode;

      // Node v8.x - convert Uint8Array to Buffer - not needed for v10
      iv = Buffer.from(iv);
      message = Buffer.from(message);

      // Create message cipher using Node Crypto async
      return new Promise(resolve => {
        const cipher = isEncode
          ? nodeCrypto.createCipheriv(cipherName, key, iv)
          : nodeCrypto.createDecipheriv(cipherName, key, iv);

        cipher.setAutoPadding(padding);

        const resultBuffer = Buffer.concat([
          cipher.update(message),
          cipher.final()
        ]);

        resolve(new Uint8Array(resultBuffer));
      });
    } else {
      const cipherName = algorithm.browserAlgorithm + "-" + mode;

      // Get crypto subtle instance
      const crypto = window.crypto || window.msCrypto;
      const cryptoSubtle = crypto.subtle || crypto.webkitSubtle;

      // Create message cipher using Web Crypto API
      const algo = {
        name: cipherName,
        iv,
        counter: iv,
        length: algorithm.blockSize
      };

      // Create key instance
      const cryptoKey = await cryptoSubtle.importKey("raw", key, algo, false, [
        "encrypt",
        "decrypt"
      ]);

      let result = isEncode
        ? cryptoSubtle.encrypt(algo, cryptoKey, message)
        : cryptoSubtle.decrypt(algo, cryptoKey, message);

      // IE11 exception
      /*if (result.oncomplete !== undefined) {
        // Wrap IE11 CryptoOperation object in a promise
        result = new Promise((resolve, reject) => {
          result.oncomplete = resolve.bind(this, result.result)
          result.onerror = reject
        })
      }*/

      return result.then(result => {
        let bytes = new Uint8Array(result);

        // Gambi for no-padding (encrypt-only)
        if (isEncode && !padding && mode == "cbc")
          bytes = bytes.slice(0, bytes.length - algorithm.blockSize);

        return bytes;
      });
    }
  }
}
