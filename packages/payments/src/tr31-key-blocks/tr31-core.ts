import { calculateCMAC, getCipherName } from "@cryptographix/cryptography";
import { ByteArray } from "@cryptographix/core";
import { BlockCipher } from "@cryptographix/cryptography";

/**
 *
 */
export class TR31 {
  protected bpkeyType: string;
  protected kbak: Uint8Array;
  protected kbek: Uint8Array;

  /**
   *
   */
  async deriveBlockKeys(keyType: string, kbpkKey: Uint8Array) {
    this.bpkeyType = keyType;
    const keyLength = kbpkKey.length;

    let kbek = await calculateCMAC(
      ByteArray.fromString("0100000000040100", "hex"),
      keyType,
      kbpkKey
    );

    if (keyLength > 16) {
      let kbek2 = await calculateCMAC(
        ByteArray.fromString("0200000000040100", "hex"),
        keyType,
        kbpkKey
      );

      kbek = ByteArray.concat([kbek, kbek2]);
    }
    this.kbek = kbek;

    //console.log( "kbek:" + ByteArray.toString(this.kbek,'hex'));

    let kbak = await calculateCMAC(
      ByteArray.fromString("0100010000040100", "hex"),
      keyType,
      kbpkKey
    );
    if (keyLength > 16) {
      let kbak2 = await calculateCMAC(
        ByteArray.fromString("0200010000040100", "hex"),
        keyType,
        kbpkKey
      );

      kbak = ByteArray.concat([kbak, kbak2]);
    }
    this.kbak = kbak;

    //console.log( " kbak:" + ByteArray.toString(this.kbak,'hex'));
  }

  protected blockHeader: Uint8Array;
  protected plainKeyData: Uint8Array;
  protected plainKeyBuffer: Uint8Array;

  /**
   *
   */
  setBlockHeader(blockHeader: string): this {
    this.blockHeader = ByteArray.fromString(blockHeader);

    //console.log('header:' + ByteArray.toString(this.blockHeader,'hex'));

    return this;
  }

  /**
   *
   */
  setBlockKeyData(plainKeyData: Uint8Array): this {
    this.plainKeyData = plainKeyData;

    //console.log('key:' + ByteArray.toString(plainKeyData,'hex'));

    return this;
  }

  /**
   *
   */
  padKeyData(_totalLength: number, padding?: Uint8Array): this {
    let keyLengthBits = 8 * this.plainKeyData.length;

    let keyLen = ByteArray.from([keyLengthBits >> 8, keyLengthBits & 0xff]);

    //let paddingLen = totalLength - 2 - this.plainKeyData.length;

    this.plainKeyBuffer = ByteArray.concat([
      keyLen,
      this.plainKeyData,
      padding
    ]);
    //console.log( ByteArray.toString(this.plainKeyBuffer,'hex'));

    return this;
  }

  /**
   *
   */
  protected async calculateMAC(): Promise<Uint8Array> {
    let macData = ByteArray.concat([this.blockHeader, this.plainKeyBuffer]);
    //console.log( ByteArray.toString(macData, 'hex'))
    //assert.equal( ByteArray.toString(macData,'hex'), '4430313132503041453030453030303000803f419e1cb7079442aa37474c2efbf8b81c2965473ce206bb855b01533782');//00803f419e1cb7079442aa37474c2efbf8b81c2965473ce206bb855b01533782')

    return calculateCMAC(macData, this.bpkeyType, this.kbak);
    //console.log( "mac:" + ByteArray.toString(mac,'hex'));
    //assert.equal( ByteArray.toString(mac,'hex'), '7e8e31da05f7425509593d03a457dc34')
  }

  /**
   *
   */
  protected async calculateEncryptedKey(mac: Uint8Array): Promise<Uint8Array> {
    // AES-CBC using MAC as IV
    return BlockCipher.createCipher(
      getCipherName(this.bpkeyType, this.kbek.length),
      "cbc",
      this.kbek,
      mac,
      false,
      true,
      this.plainKeyBuffer
    );

    //console.log( "enc:" + ByteArray.toString(enc,'hex'));
    //assert.equal( ByteArray.toString(enc,'hex'), 'b82679114f470f540165edfbf7e250fcea43f810d215f8d207e2e417c07156a2')
  }

  /**
   *
   */
  async generateKeyBlock(): Promise<Uint8Array> {
    let mac = await this.calculateMAC();
    let enc = await this.calculateEncryptedKey(mac);

    let keyBlock = ByteArray.concat([this.blockHeader, enc, mac]);

    return keyBlock;
  }
}
