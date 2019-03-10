import { ByteArray } from '@cryptographix/core';
import { BlockCipher } from '@cryptographix/cryptography';

export function getCipherName( keyType: string, keyLength: number ) {
  const isAES = ( keyType == 'AES' );

  let cipherName = ( isAES ) ? `aes-${8*keyLength}` : 'des-2';

  return cipherName;
}

export async function generateSubKeys( keyType: string, macKey: Uint8Array ): Promise<{ k1: Uint8Array, k2: Uint8Array }> {
  const isAES = ( keyType == 'AES' );

  const valR = isAES ? ByteArray.from( '00000000000000000000000000000087', 'hex')
                     : ByteArray.from( '000000000000001B', 'hex')

  let zeros = ByteArray.from( '0000000000000000', 'hex');
  if ( isAES ) {
    zeros = Buffer.concat( [ zeros, zeros ] );
  }

  let cipherName = getCipherName( keyType, macKey.length );

  let s = await BlockCipher.createCipher(
    cipherName,
    'ecb',
    macKey,
    null,
    false,
    true,
    zeros );

  let K1 = ByteArray.shiftBitsLeft( s );

	if ( s[ 0 ] & 0x80 ) {
    K1 = ByteArray.xor( K1, valR );
  }

  let K2 = ByteArray.shiftBitsLeft( K1 );

  if ( K1[ 0 ] & 0x80 ) {
    K2 = ByteArray.xor( K2, valR );
  }

  return {
    k1: K1,
    k2: K2,
  }
}

export async function calculateCMAC( msg: Uint8Array, keyType: string, macKey: Uint8Array ): Promise<Uint8Array> {
  const keyLength = macKey.length;
  const isAES = ( keyType == 'AES' );
  const blockLen = (isAES) ? 16 : 8;

  let keys = await generateSubKeys( keyType, macKey );

  let msgN = msg;
  let xorKey = keys.k1;

  if ( msg.length % blockLen != 0 ) {
    let padLen = blockLen - ( msg.length % blockLen );
    let padBytes = new Uint8Array( padLen );

    padBytes[ 0 ] = 0x80;
    for( let i = 1; i < padLen; ++i ) {
      padBytes[ i ] = 0x00;
    }

    msgN = ByteArray.concat( [ msg, padBytes ] );
    xorKey = keys.k2;
    //console.log( 'padded' )
  }

  //console.log( msgN.toString( 'hex' ) );

  let nOffset = msgN.length - blockLen;

  let block = ByteArray.xor( msgN.slice( nOffset, nOffset + blockLen ), xorKey );
  msgN.set( block, nOffset );

  let zeros = ByteArray.from( '0000000000000000', 'hex');
  if ( isAES ) zeros = Buffer.concat( [ zeros, zeros ] );

  let iv = zeros;

  let cipherName = getCipherName( keyType, keyLength );

  let ct = await BlockCipher.createCipher(
    cipherName,
    'cbc',
    macKey,
    iv,
    false,
    true,
    msgN );

  //console.log( msgN.toString( 'hex' ) );
  //console.log( ct.toString( 'hex' ) );

  return ct.slice( nOffset );
}
