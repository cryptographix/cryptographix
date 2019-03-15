import { ByteArray } from '@cryptographix/core';

export interface IKey<IKeyData> extends Partial<CryptoKey> {
  data?: IKeyData;
}

export interface ISecretKeyData {
  k: ByteArray;
}

/**
 * AES
 */
export interface IAESKey extends IKey<ISecretKeyData> {
  algorithm: { name: 'AES-ECB'|'AES-CBC'|'AES-CTR' },
  type: 'secret'
}

/**
 * DES
 */
export interface IDESKey extends IKey<ISecretKeyData> {
  algorithm: { name: 'DES-ECB'|'DES-CBC'|'DES-CTR' },
  type: 'secret'
}

/**
 * RSA
 */
export interface IRSAKeyData {
  n: ByteArray;
  e: ByteArray;
  d?: ByteArray;
}

export interface IRSAKey extends IKey<IRSAKeyData> {
  algorithm: { name: 'RSASSA-PKCS1-v1_5'|'RSAES-PKCS1-v1_5'|'RSA-OAEP'|'RSA-NOPAD' },
  type: 'public'|'private'
}
