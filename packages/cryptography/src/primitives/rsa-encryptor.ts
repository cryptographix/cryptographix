import { ByteArray } from '@cryptographix/core';
import { IRSAKey } from '@cryptographix/cryptography';

import './node-forge';
import { forge } from './node-forge';



export class RSAEncryptor {
  _key: IRSAKey;

  constructor( key: IRSAKey ) {
    this._key = key;
  }

  async decrypt( data: ByteArray ): Promise<ByteArray> {
    let key = {
      e: new forge.jsbn.BigInteger( ByteArray.toString( this._key.data.e, 'hex' ), 16 ),
      n: new forge.jsbn.BigInteger( ByteArray.toString( this._key.data.n, 'hex'), 16 )
    };

    let plain = forge.pki.rsa.decrypt( ByteArray.toString(data), key, true, false );

    return Promise.resolve<ByteArray>( ByteArray.fromString( plain ) );
  }
}
