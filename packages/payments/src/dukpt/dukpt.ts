import { ByteArray, H2BA } from '@cryptographix/core';
import { IAESKey, IDESKey } from '@cryptographix/cryptography';
import { BlockCipherEncoder } from '@cryptographix/cryptography';

type ISymKey = IAESKey | IDESKey;
type DUKPTMode = 'pinkey'|'datakey'|'mackey';

function fieldEmpty( ba: ByteArray[] ): boolean {
  return ba.filter( b => { return !b || b.length == 0; } ).length > 0;
}

function buildKey( baseKey: ISymKey, k: Uint8Array ): ISymKey {
  return {
    ...baseKey,
    data: { k }
  }
}
export class DUKPT {
  bdk: ISymKey;
  ksn: string;

    constructor(bdk: ISymKey, ksn: string) {
        this.bdk = bdk;
        this.ksn = ksn.replace(/\s/g, '');
    }

    async _deriveDUKPTSessionKey(keyMode: DUKPTMode = 'datakey'): Promise<ISymKey> {
        const bdk = this.bdk;
        const ksn = this.ksn;

        if (bdk.data.k.length !== 16 ||
            ksn.length !== 20) {
            throw new Error('Key must be 16 bytes long and KSN must be 10 bytes');
        }

        const ipek = await DUKPT._createIPEK(bdk, ksn); // Always start with IPEK

        if (keyMode === 'datakey') {
          return DUKPT._createDataKey(ipek, ksn);
        }

        if (keyMode === 'pinkey') {
            return DUKPT._createPINKey(ipek, ksn);
        }

        if (keyMode === 'mackey') {
            return DUKPT._createMACKey(ipek, ksn);
        }
    }

    static async generateDUKPTSessionKey(ipek: ISymKey, ksn) {
        if (fieldEmpty([ipek, ksn])) {
            throw new Error('either IPEK or data params not provided');
        }

        return DUKPT._createDataKey(ipek, ksn);
    }

    static async _createDataKey(ipek: ISymKey, ksn) {
        const derivedPEK = await DUKPT._deriveKey(ipek, ksn);

        const CBC = 1; // cipher block chaining enabled
        const variantMask = H2BA('0000000000FF00000000000000FF0000'); // data variant

        const masked = ByteArray.xor(variantMask, derivedPEK.data.k);

        const maskedPEK = buildKey( ipek, DUKPT._EDE3KeyExpand( masked ) ) // apply mask

        // We need to TDES-encrypt the masked key in two parts, using
        // itself as the key. This is a so-called one-way function (OWF).
        // The leftmost 8 bytes are encrypted, then
        // the rightmost 8 bytes are encrypted separately. In each case,
        // the key is the entire original 16-byte maskedPEK from the
        // above step, expanded to 24 bytes per EDE3.

        // left half:
        const left = await DUKPT._des(maskedPEK,
            masked.slice( 0, 8 ),
            true,
            CBC,
            DUKPT.zeroIV);

        // right half:
        const right = await DUKPT._des(maskedPEK,
            masked.slice( 8, 16 ),
            true,
            CBC,
            DUKPT.zeroIV );

        return buildKey( ipek, ByteArray.concat( [left, right] ) );
    }

    static async _createPINKey(ipek: ISymKey, ksn) {
        const derivedPEK = await DUKPT._deriveKey(ipek, ksn); // derive DUKPT basis key
        const variantMask = H2BA('00000000000000FF00000000000000FF'); // PIN variant

        return buildKey( ipek, ByteArray.xor(variantMask, derivedPEK.data.k) ); // apply mask
    }

    static async _createMACKey(ipek: ISymKey, ksn) {
        const derivedPEK = await DUKPT._deriveKey(ipek, ksn); // derive DUKPT basis key
        const variantMask = H2BA('000000000000FF00000000000000FF00'); // MAC variant

        return buildKey( ipek, ByteArray.xor(variantMask, derivedPEK.data.k) ); // apply mask
    }

    static zeroIV = ByteArray.from( [0,0,0,0,0,0,0,0] );

    static async encryptTDES(key: ISymKey, data: ByteArray, encryptTrueFalse) {
        const CBC = 1; // cipher block chaining enabled
        let padded = data.slice();

        try {
            // data should be a multiple of 8 bytes
            while (padded.length % 8) {
                padded = ByteArray.concat( [ padded, ByteArray.from([0])]);
            }

            return DUKPT._des(key,
                padded,
                encryptTrueFalse,
                CBC,
                DUKPT.zeroIV );
        } catch (e) {
            throw e;
        }
    }

    async encryptDUKPT(dataToEncrypt: ByteArray, encryptOptions?): Promise<ByteArray> {
        let data = dataToEncrypt;
        let encryptedOutput = null;

        const _defaultOptions = {
          encryptionMode: '3DES',
        };

        const options = Object.assign({}, _defaultOptions, encryptOptions);

        let key = await this._deriveDUKPTSessionKey();

        if (!key || !data) {
            throw new Error('either session key or data not provided');
        }

        if (key.data.k.length === 16 && options.encryptionMode.toUpperCase() !== 'AES') {
            key.data.k = DUKPT._EDE3KeyExpand(key.data.k);
        }

        switch (options.encryptionMode.toUpperCase()) {
        case '3DES':
            encryptedOutput = DUKPT.encryptTDES(key, data, true);
            break;
        case 'AES':
            encryptedOutput = DUKPT.encryptAES(key, data);
            break;
        default:
            throw new Error('unsupported DUKPT encryption method');
        }

        return encryptedOutput;
    }

    async decryptDUKPT(dataToDecrypt: ByteArray, decryptOptions?): Promise<ByteArray> {
        let encryptedData = dataToDecrypt;
        let decryptedOutput = null;

        const _defaultOptions = {
            decryptionMode: '3DES',
        };

        const options = Object.assign({}, _defaultOptions, decryptOptions);

        let key = await this._deriveDUKPTSessionKey();

        if (!key || !encryptedData) {
            throw new Error('either session key or data not provided');
        }

        if (key.data.k.length === 16 && options.decryptionMode.toUpperCase() !== 'AES') {
            key.data.k = DUKPT._EDE3KeyExpand(key.data.k);
        }

        switch (options.decryptionMode.toUpperCase()) {
        case '3DES':
            decryptedOutput = DUKPT.encryptTDES(key, encryptedData, false);
            break;
        case 'AES':
            decryptedOutput = DUKPT.decryptAES(key, encryptedData);
            break;
        default:
            throw new Error('unsupported DUKPT decryption method');
        }

        return decryptedOutput;
    }

    static _EDE3KeyExpand(key: ByteArray) {
        return ByteArray.concat( [ key, key.slice( 0, key.length / 2) ] );
    }

    static async _createIPEK(bdk: ISymKey, ksn: string): Promise<ISymKey> {
        const CBC = 1; // cipher block chaining enabled

        let key =  buildKey( bdk, DUKPT._EDE3KeyExpand(bdk.data.k) ) // make 24-byte key

        let maskedKSN = ByteArray.and(
            H2BA('FFFFFFFFFFFFFFE00000'),
            H2BA(ksn)
        );

        maskedKSN = maskedKSN.slice(0, 8); // take 1st 8 bytes only

        // get LEFT half of IPEK
        const leftIPEK = await DUKPT._des(key,
            maskedKSN,
            true, /* encrypt */
            CBC,
            DUKPT.zeroIV);

        // get RIGHT half of IPEK
        const mask = 'C0C0C0C000000000C0C0C0C000000000';
        const mkey = ByteArray.xor(H2BA(mask), bdk.data.k);
        key =  buildKey( bdk, DUKPT._EDE3KeyExpand(mkey) ) // make 24-byte key

        const rightIPEK = await DUKPT._des(key,
            maskedKSN,
            true, /* encrypt */
            CBC,
            DUKPT.zeroIV);


        // Transform into IKey of same type as BDK
        return buildKey( bdk, ByteArray.concat( [ leftIPEK, rightIPEK ] ) );
    }

    static _getCounter(ksn: ByteArray): number {
        const tailbytes = ksn.slice(ksn.length - 3);
        const integerValue = (tailbytes[0] << 16) +
            (tailbytes[1] << 8) +
            tailbytes[2];
        return integerValue & 0x1FFFFF;
    }

    static async _deriveKey(ipek: ISymKey, ksnString: string): Promise<ISymKey> {
        let ksn = H2BA(ksnString);
        if (ksn.length === 10) {
            ksn = ksn.slice(2);
        } // we want the bottom 8 bytes

        let baseKSN = ByteArray.and(H2BA('FFFFFFFFFFE00000'), ksn);
        let curKey = { ...ipek };
        const counter = DUKPT._getCounter(ksn);

        for (let shiftReg = 0x100000; shiftReg > 0; shiftReg >>= 1) {
            if ((shiftReg & counter) > 0) {
                // Need to do baseKSN |= shiftReg

                let tmpKSN = baseKSN.slice(0, 5);
                const byte5 = baseKSN[5];
                const byte6 = baseKSN[6];
                const byte7 = baseKSN[7];
                let tmpLong = (byte5 << 16) + (byte6 << 8) + byte7;
                tmpLong |= shiftReg;
                tmpKSN = ByteArray.concat( [
                  tmpKSN,
                  ByteArray.from( [ tmpLong >> 16, 255 & (tmpLong >> 8), 255 & tmpLong ] )
                ] );

                baseKSN = tmpKSN; // remember the updated value

                curKey = buildKey( ipek, await DUKPT._generateKey(curKey, tmpKSN) );
            }
        }

        return curKey; // binary Key
    }

    static async _generateKey(key: ISymKey, ksn: ByteArray) {
        const mask = 'C0C0C0C000000000C0C0C0C000000000';
        const maskedKey = buildKey( key, ByteArray.xor(H2BA(mask), key.data.k) );

        const left = await DUKPT._encryptRegister(maskedKey, ksn);
        const right = await DUKPT._encryptRegister(key, ksn);

        return ByteArray.concat( [ left, right ] ); // binary
    }

    static async _encryptRegister(key: ISymKey, reg: ByteArray) {
        const CBC = 1; // cipher block chaining enabled

        const bottom8 = key.data.k.slice(key.data.k.length - 8); // bottom 8 bytes

        const top8 = key.data.k.slice(0, 8); // top 8 bytes

        const bottom8xorKSN = ByteArray.xor( bottom8, reg );

        let top8Key: ISymKey = {
          algorithm: { name: "DES-CBC" },
          type: 'secret',
          data: { k: top8 }
        };

        // This will be single-DES because of the 8-byte key:
        const desEncrypted = await DUKPT._des(top8Key,
            bottom8xorKSN,
            true, /* encrypt */
            CBC,
            DUKPT.zeroIV);

        return ByteArray.xor(bottom8, desEncrypted);
    }

    static async _des(key: ISymKey, message: ByteArray, encrypt: boolean, mode: 0|1, iv: ByteArray) {
      let enc = new BlockCipherEncoder();
      let len = key.data.k.length;

      enc.settings = {
        algorithm: (len == 8 ) ? "DES" : "DES3",
        key: key.data.k,
        mode: "CBC",
        iv,
      }

      return enc.transform( message, encrypt );
    }

    static encryptAES(key: ISymKey, data: ByteArray) {

        if (key.data.k.length !== 16) {
            throw new Error('Key must be 16 bytes for AES.');
        }

        while (data.length % 16) { data = ByteArray.concat( [ data, ByteArray.from( [0] ) ] ); }  // pad with zeroes

        // AES enc - CBC
    }

    static decryptAES(key, data) {
      // AES dec - CBC
    }
}
